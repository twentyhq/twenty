import { type FlatViewFilter } from '@/metadata-store/types/FlatViewFilter';
import { UPSERT_VIEW_WIDGET } from '@/page-layout/graphql/mutations/upsertViewWidget';
import { useSaveRecordTableWidgetViews } from '@/page-layout/hooks/useSaveRecordTableWidgetViews';
import { pageLayoutDraftComponentState } from '@/page-layout/states/pageLayoutDraftComponentState';
import { recordTableWidgetViewDraftComponentState } from '@/page-layout/states/recordTableWidgetViewDraftComponentState';
import {
  makeDraft,
  makeTab,
  makeWidget,
} from '@/page-layout/testing/pageLayoutDraftFixtures';
import { type PageLayoutWidget } from '@/page-layout/types/PageLayoutWidget';
import { buildRecordTableWidgetViewSnapshot } from '@/page-layout/widgets/record-table/utils/buildRecordTableWidgetViewSnapshot';
import { type MockedResponse } from '@apollo/client/testing';
import { MockedProvider } from '@apollo/client/testing/react';
import { act, renderHook } from '@testing-library/react';
import { createStore, Provider as JotaiProvider } from 'jotai';
import { type ReactNode } from 'react';
import { ViewFilterOperand } from 'twenty-shared/types';
import {
  WidgetConfigurationType,
  WidgetType,
  type UpsertViewWidgetInput,
} from '~/generated-metadata/graphql';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';

const PAGE_LAYOUT_ID = 'page-layout-id';
const WIDGET_ID = 'widget-id';

const SOURCE_FIELD_METADATA_ID = '20202020-51cf-4b06-b1d3-a836e857f9dd';
const RELATION_TARGET_FIELD_METADATA_ID =
  '20202020-1af7-4b09-a58a-b18aaaa12b83';

const snapshot = buildRecordTableWidgetViewSnapshot(
  getMockObjectMetadataItemOrThrow('company'),
);

const relationTraversalViewFilter: FlatViewFilter = {
  id: 'view-filter-id',
  fieldMetadataId: SOURCE_FIELD_METADATA_ID,
  operand: ViewFilterOperand.IS,
  value: JSON.stringify({
    isCurrentRecordSelected: true,
    selectedRecordIds: [],
  }),
  viewFilterGroupId: null,
  positionInViewFilterGroup: null,
  subFieldName: null,
  relationTargetFieldMetadataId: RELATION_TARGET_FIELD_METADATA_ID,
  viewId: snapshot.view.id,
};

const recordTableWidget = {
  ...makeWidget(WIDGET_ID, 0),
  type: WidgetType.RECORD_TABLE,
  configuration: {
    __typename: 'RecordTableConfiguration' as const,
    configurationType: WidgetConfigurationType.RECORD_TABLE,
    viewId: snapshot.view.id,
  },
} as unknown as PageLayoutWidget;

const upsertViewWidgetResult = jest.fn(
  (variables: { input: UpsertViewWidgetInput }) => ({
    data: {
      upsertViewWidget: {
        __typename: 'View',
        id: variables.input.widgetId,
        viewGroups: [],
      },
    },
  }),
);

const mocks: MockedResponse[] = [
  {
    request: {
      query: UPSERT_VIEW_WIDGET,
      variables: () => true,
    },
    maxUsageCount: Number.POSITIVE_INFINITY,
    result: upsertViewWidgetResult,
  },
];

const getWrapper =
  (store: ReturnType<typeof createStore>) =>
  ({ children }: { children: ReactNode }) => (
    <JotaiProvider store={store}>
      <MockedProvider
        mocks={mocks}
        defaultOptions={{ mutate: { fetchPolicy: 'no-cache' } }}
      >
        {children}
      </MockedProvider>
    </JotaiProvider>
  );

describe('useSaveRecordTableWidgetViews', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should include relationTargetFieldMetadataId in the upsert view filters input', async () => {
    const store = createStore();

    store.set(
      pageLayoutDraftComponentState.atomFamily({
        instanceId: PAGE_LAYOUT_ID,
      }),
      makeDraft([makeTab('tab-1', [recordTableWidget])]),
    );
    store.set(
      recordTableWidgetViewDraftComponentState.atomFamily({
        instanceId: PAGE_LAYOUT_ID,
      }),
      {
        [WIDGET_ID]: {
          ...snapshot,
          viewFilters: [relationTraversalViewFilter],
        },
      },
    );

    const { result } = renderHook(() => useSaveRecordTableWidgetViews(), {
      wrapper: getWrapper(store),
    });

    await act(async () => {
      await result.current.saveRecordTableWidgetViews(PAGE_LAYOUT_ID);
    });

    expect(upsertViewWidgetResult).toHaveBeenCalledTimes(1);

    const { input } = upsertViewWidgetResult.mock.calls[0][0];

    expect(input.widgetId).toBe(WIDGET_ID);
    expect(input.viewFilters).toEqual([
      expect.objectContaining({
        id: relationTraversalViewFilter.id,
        fieldMetadataId: SOURCE_FIELD_METADATA_ID,
        relationTargetFieldMetadataId: RELATION_TARGET_FIELD_METADATA_ID,
      }),
    ]);
  });

  it('should send undefined relationTargetFieldMetadataId for direct filters', async () => {
    const store = createStore();

    store.set(
      pageLayoutDraftComponentState.atomFamily({
        instanceId: PAGE_LAYOUT_ID,
      }),
      makeDraft([makeTab('tab-1', [recordTableWidget])]),
    );
    store.set(
      recordTableWidgetViewDraftComponentState.atomFamily({
        instanceId: PAGE_LAYOUT_ID,
      }),
      {
        [WIDGET_ID]: {
          ...snapshot,
          viewFilters: [
            {
              ...relationTraversalViewFilter,
              relationTargetFieldMetadataId: null,
            },
          ],
        },
      },
    );

    const { result } = renderHook(() => useSaveRecordTableWidgetViews(), {
      wrapper: getWrapper(store),
    });

    await act(async () => {
      await result.current.saveRecordTableWidgetViews(PAGE_LAYOUT_ID);
    });

    expect(upsertViewWidgetResult).toHaveBeenCalledTimes(1);

    const { input } = upsertViewWidgetResult.mock.calls[0][0];

    expect(input.viewFilters?.[0].relationTargetFieldMetadataId).toBe(
      undefined,
    );
  });
});
