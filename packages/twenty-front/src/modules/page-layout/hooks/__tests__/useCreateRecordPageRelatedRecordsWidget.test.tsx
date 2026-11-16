import {
  PAGE_LAYOUT_TEST_INSTANCE_ID,
  PageLayoutTestWrapper,
} from '@/page-layout/hooks/__tests__/PageLayoutTestWrapper';
import { useCreateRecordPageRelatedRecordsWidget } from '@/page-layout/hooks/useCreateRecordPageRelatedRecordsWidget';
import { pageLayoutDraftComponentState } from '@/page-layout/states/pageLayoutDraftComponentState';
import { recordTableWidgetViewDraftComponentState } from '@/page-layout/states/recordTableWidgetViewDraftComponentState';
import {
  makeDraft,
  makeTab,
} from '@/page-layout/testing/pageLayoutDraftFixtures';
import { act, renderHook } from '@testing-library/react';
import { createStore } from 'jotai';
import type * as Jotai from 'jotai';
import { type ReactNode } from 'react';
import { SidePanelPages } from 'twenty-shared/types';
import { FieldDisplayMode, ViewType } from '~/generated-metadata/graphql';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';
import { getTestEnrichedObjectMetadataItemsMock } from '~/testing/utils/getTestEnrichedObjectMetadataItemsMock';

const mockNavigatePageLayoutSidePanel = jest.fn();
const mockFieldWidgetEligibleFieldNames = jest.fn<string[], []>();

jest.mock(
  '@/side-panel/pages/page-layout/hooks/useNavigatePageLayoutSidePanel',
  () => ({
    useNavigatePageLayoutSidePanel: () => ({
      navigatePageLayoutSidePanel: mockNavigatePageLayoutSidePanel,
    }),
  }),
);

jest.mock('@/object-metadata/hooks/useObjectMetadataItem', () => ({
  useObjectMetadataItem: () => ({
    objectMetadataItem: getMockObjectMetadataItemOrThrow('company'),
  }),
}));

jest.mock('@/object-metadata/hooks/useObjectMetadataItems', () => ({
  useObjectMetadataItems: () => ({
    objectMetadataItems: getTestEnrichedObjectMetadataItemsMock(),
  }),
}));

jest.mock('@/object-metadata/states/objectMetadataItemsSelector', () => {
  const { atom } = jest.requireActual<typeof Jotai>('jotai');

  return {
    objectMetadataItemsSelector: {
      type: 'Selector',
      atom: atom(() => getTestEnrichedObjectMetadataItemsMock()),
    },
  };
});

jest.mock(
  '@/page-layout/widgets/field/hooks/useFieldWidgetEligibleFields',
  () => ({
    useFieldWidgetEligibleFields: () =>
      getMockObjectMetadataItemOrThrow('company').fields.filter((field) =>
        mockFieldWidgetEligibleFieldNames().includes(field.name),
      ),
  }),
);

const renderCreateHook = () => {
  const store = createStore();

  store.set(
    pageLayoutDraftComponentState.atomFamily({
      instanceId: PAGE_LAYOUT_TEST_INSTANCE_ID,
    }),
    makeDraft([makeTab('tab-1', [])]),
  );

  const { result } = renderHook(
    () =>
      useCreateRecordPageRelatedRecordsWidget({
        objectNameSingular: 'company',
      }),
    {
      wrapper: ({ children }: { children: ReactNode }) => (
        <PageLayoutTestWrapper store={store}>{children}</PageLayoutTestWrapper>
      ),
    },
  );

  const getWidgets = () =>
    store.get(
      pageLayoutDraftComponentState.atomFamily({
        instanceId: PAGE_LAYOUT_TEST_INSTANCE_ID,
      }),
    ).tabs[0].widgets;

  const getViewDrafts = () =>
    store.get(
      recordTableWidgetViewDraftComponentState.atomFamily({
        instanceId: PAGE_LAYOUT_TEST_INSTANCE_ID,
      }),
    );

  return { result, getWidgets, getViewDrafts };
};

describe('useCreateRecordPageRelatedRecordsWidget', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFieldWidgetEligibleFieldNames.mockReturnValue([
      'name',
      'people',
      'opportunities',
    ]);
  });

  it('should add a kanban of related records scoped to the current record', () => {
    const { result, getWidgets, getViewDrafts } = renderCreateHook();

    act(() => {
      result.current.createRecordPageRelatedRecordsWidget({
        tabId: 'tab-1',
        layoutViewType: ViewType.KANBAN_WIDGET,
      });
    });

    const [widget] = getWidgets();
    const viewDraft = getViewDrafts()[widget.id];

    expect(widget.title).toBe('Opportunities');
    expect(widget.configuration).toMatchObject({
      fieldDisplayMode: FieldDisplayMode.TABLE,
      viewId: viewDraft.view.id,
    });
    expect(viewDraft.view.type).toBe(ViewType.KANBAN_WIDGET);
    expect(JSON.parse(viewDraft.viewFilters[0].value)).toMatchObject({
      isCurrentRecordSelected: true,
    });
    expect(mockNavigatePageLayoutSidePanel).toHaveBeenCalledTimes(1);
    expect(mockNavigatePageLayoutSidePanel).toHaveBeenCalledWith(
      expect.objectContaining({
        sidePanelPage: SidePanelPages.RecordPageFieldSettings,
      }),
    );
  });

  it('should pick a relation the tab does not show yet', () => {
    const { result, getWidgets } = renderCreateHook();

    act(() => {
      result.current.createRecordPageRelatedRecordsWidget({
        tabId: 'tab-1',
        layoutViewType: ViewType.TABLE_WIDGET,
      });
    });
    act(() => {
      result.current.createRecordPageRelatedRecordsWidget({
        tabId: 'tab-1',
        layoutViewType: ViewType.TABLE_WIDGET,
      });
    });

    expect(getWidgets().map((widget) => widget.title)).toEqual([
      'People',
      'Opportunities',
    ]);
  });

  it('should offer no layout and create nothing without a has-many relation', () => {
    mockFieldWidgetEligibleFieldNames.mockReturnValue(['name']);

    const { result, getWidgets } = renderCreateHook();

    expect(result.current.relatedRecordsLayoutOptions).toEqual([]);

    act(() => {
      result.current.createRecordPageRelatedRecordsWidget({
        tabId: 'tab-1',
        layoutViewType: ViewType.TABLE_WIDGET,
      });
    });

    expect(getWidgets()).toEqual([]);
  });
});
