import { useSavePageLayout } from '@/page-layout/hooks/useSavePageLayout';
import { pageLayoutDraftComponentState } from '@/page-layout/states/pageLayoutDraftComponentState';
import {
  makeDraft,
  makeTab,
  makeWidget,
} from '@/page-layout/testing/pageLayoutDraftFixtures';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { act, renderHook } from '@testing-library/react';
import { createStore } from 'jotai';
import { type ReactNode } from 'react';
import { WidgetType } from '~/generated-metadata/graphql';
import { TEST_BAR_CHART_CONFIGURATION } from '~/testing/mock-data/widget-configurations';
import {
  PAGE_LAYOUT_TEST_INSTANCE_ID,
  PageLayoutTestWrapper,
} from './PageLayoutTestWrapper';

const updatePageLayoutWithTabsAndWidgets = jest.fn();
const createPendingFieldsWidgetViews = jest.fn();
const createPendingRecordTableWidgetViews = jest.fn();
const enqueueToast = jest.fn();

jest.mock('@/page-layout/hooks/useUpdatePageLayoutWithTabsAndWidgets', () => ({
  useUpdatePageLayoutWithTabsAndWidgets: () => ({
    updatePageLayoutWithTabsAndWidgets,
  }),
}));

jest.mock('@/page-layout/hooks/useCreatePendingFieldsWidgetViews', () => ({
  useCreatePendingFieldsWidgetViews: () => ({
    createPendingFieldsWidgetViews,
  }),
}));

jest.mock('@/page-layout/hooks/useCreatePendingRecordTableWidgetViews', () => ({
  useCreatePendingRecordTableWidgetViews: () => ({
    createPendingRecordTableWidgetViews,
  }),
}));

jest.mock('@/object-metadata/hooks/useObjectMetadataItems', () => ({
  useObjectMetadataItems: () => ({ objectMetadataItems: [] }),
}));

jest.mock('twenty-ui/components/feedback', () => ({
  ...jest.requireActual('twenty-ui/components/feedback'),
  useToast: () => ({ enqueueToast }),
}));

const makeChartWidget = (
  configuration: PageLayoutWidget['configuration'],
): PageLayoutWidget => ({
  ...makeWidget('chart-widget', 0),
  type: WidgetType.GRAPH,
  title: 'Revenue by stage',
  configuration,
});

const renderSaveHook = (widgets: PageLayoutWidget[]) => {
  const store = createStore();

  store.set(
    pageLayoutDraftComponentState.atomFamily({
      instanceId: PAGE_LAYOUT_TEST_INSTANCE_ID,
    }),
    makeDraft([makeTab('tab-1', widgets)]),
  );

  return renderHook(() => useSavePageLayout(PAGE_LAYOUT_TEST_INSTANCE_ID), {
    wrapper: ({ children }: { children: ReactNode }) => (
      <PageLayoutTestWrapper store={store}>{children}</PageLayoutTestWrapper>
    ),
  });
};

describe('useSavePageLayout', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    updatePageLayoutWithTabsAndWidgets.mockResolvedValue({
      status: 'failed',
      error: new Error('request failed'),
    });
  });

  it('should send nothing and name the chart when a chart misses a required field', async () => {
    const { result } = renderSaveHook([
      makeChartWidget({
        ...TEST_BAR_CHART_CONFIGURATION,
        primaryAxisGroupByFieldMetadataId: undefined,
      } as PageLayoutWidget['configuration']),
    ]);

    const saveResult = await act(() => result.current.savePageLayout());

    expect(saveResult.status).toBe('failed');
    expect(enqueueToast).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 'error',
        children:
          'Finish configuring the chart "Revenue by stage" before saving.',
      }),
    );
    expect(createPendingFieldsWidgetViews).not.toHaveBeenCalled();
    expect(updatePageLayoutWithTabsAndWidgets).not.toHaveBeenCalled();
  });

  it('should send the layout when every chart has its required fields', async () => {
    const { result } = renderSaveHook([
      makeChartWidget(TEST_BAR_CHART_CONFIGURATION),
    ]);

    await act(async () => {
      await result.current.savePageLayout();
    });

    expect(enqueueToast).not.toHaveBeenCalled();
    expect(updatePageLayoutWithTabsAndWidgets).toHaveBeenCalledTimes(1);
  });
});
