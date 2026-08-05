import { currentRecordFiltersComponentState } from '@/object-record/record-filter/states/currentRecordFiltersComponentState';
import { type RecordFilter } from '@/object-record/record-filter/types/RecordFilter';
import { recordTableWidgetViewDraftComponentState } from '@/page-layout/states/recordTableWidgetViewDraftComponentState';
import { useRecordTableWidgetFilterCallbacks } from '@/page-layout/widgets/record-table/hooks/useRecordTableWidgetFilterCallbacks';
import { buildRecordTableWidgetViewSnapshot } from '@/page-layout/widgets/record-table/utils/buildRecordTableWidgetViewSnapshot';
import { act, renderHook } from '@testing-library/react';
import { createStore, Provider as JotaiProvider } from 'jotai';
import { type ReactNode } from 'react';
import { ViewFilterOperand } from 'twenty-shared/types';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';

const PAGE_LAYOUT_ID = 'page-layout-id';
const WIDGET_ID = 'widget-id';
const RECORD_INDEX_ID = 'record-index-id';

const SOURCE_FIELD_METADATA_ID = '20202020-51cf-4b06-b1d3-a836e857f9dd';
const RELATION_TARGET_FIELD_METADATA_ID =
  '20202020-1af7-4b09-a58a-b18aaaa12b83';

const snapshot = buildRecordTableWidgetViewSnapshot(
  getMockObjectMetadataItemOrThrow('company'),
);

const relationTraversalRecordFilter: RecordFilter = {
  id: 'record-filter-id',
  fieldMetadataId: SOURCE_FIELD_METADATA_ID,
  value: JSON.stringify({
    isCurrentRecordSelected: true,
    selectedRecordIds: [],
  }),
  displayValue: '',
  type: 'RELATION',
  operand: ViewFilterOperand.IS,
  label: 'Company',
  relationTargetFieldMetadataId: RELATION_TARGET_FIELD_METADATA_ID,
};

const getWrapper =
  (store: ReturnType<typeof createStore>) =>
  ({ children }: { children: ReactNode }) => (
    <JotaiProvider store={store}>{children}</JotaiProvider>
  );

describe('useRecordTableWidgetFilterCallbacks', () => {
  it('should carry relationTargetFieldMetadataId into the widget view draft filters', () => {
    const store = createStore();

    store.set(
      recordTableWidgetViewDraftComponentState.atomFamily({
        instanceId: PAGE_LAYOUT_ID,
      }),
      { [WIDGET_ID]: snapshot },
    );
    store.set(
      currentRecordFiltersComponentState.atomFamily({
        instanceId: RECORD_INDEX_ID,
      }),
      [relationTraversalRecordFilter],
    );

    const { result } = renderHook(
      () =>
        useRecordTableWidgetFilterCallbacks({
          pageLayoutId: PAGE_LAYOUT_ID,
          widgetId: WIDGET_ID,
          viewId: snapshot.view.id,
          recordIndexId: RECORD_INDEX_ID,
        }),
      { wrapper: getWrapper(store) },
    );

    act(() => {
      result.current.handleFilterUpdate();
    });

    const updatedDraft = store.get(
      recordTableWidgetViewDraftComponentState.atomFamily({
        instanceId: PAGE_LAYOUT_ID,
      }),
    );

    expect(updatedDraft[WIDGET_ID].viewFilters).toEqual([
      expect.objectContaining({
        id: relationTraversalRecordFilter.id,
        fieldMetadataId: SOURCE_FIELD_METADATA_ID,
        relationTargetFieldMetadataId: RELATION_TARGET_FIELD_METADATA_ID,
        subFieldName: null,
      }),
    ]);
  });

  it('should keep relationTargetFieldMetadataId null for direct filters', () => {
    const store = createStore();

    store.set(
      recordTableWidgetViewDraftComponentState.atomFamily({
        instanceId: PAGE_LAYOUT_ID,
      }),
      { [WIDGET_ID]: snapshot },
    );
    store.set(
      currentRecordFiltersComponentState.atomFamily({
        instanceId: RECORD_INDEX_ID,
      }),
      [
        {
          ...relationTraversalRecordFilter,
          relationTargetFieldMetadataId: undefined,
        },
      ],
    );

    const { result } = renderHook(
      () =>
        useRecordTableWidgetFilterCallbacks({
          pageLayoutId: PAGE_LAYOUT_ID,
          widgetId: WIDGET_ID,
          viewId: snapshot.view.id,
          recordIndexId: RECORD_INDEX_ID,
        }),
      { wrapper: getWrapper(store) },
    );

    act(() => {
      result.current.handleFilterUpdate();
    });

    const updatedDraft = store.get(
      recordTableWidgetViewDraftComponentState.atomFamily({
        instanceId: PAGE_LAYOUT_ID,
      }),
    );

    expect(updatedDraft[WIDGET_ID].viewFilters).toEqual([
      expect.objectContaining({
        fieldMetadataId: SOURCE_FIELD_METADATA_ID,
        relationTargetFieldMetadataId: null,
      }),
    ]);
  });
});
