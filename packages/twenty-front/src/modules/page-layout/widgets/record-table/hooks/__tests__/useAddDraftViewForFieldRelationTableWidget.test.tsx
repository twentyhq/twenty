import { recordTableWidgetViewDraftComponentState } from '@/page-layout/states/recordTableWidgetViewDraftComponentState';
import { useAddDraftViewForFieldRelationTableWidget } from '@/page-layout/widgets/record-table/hooks/useAddDraftViewForFieldRelationTableWidget';
import { act, renderHook } from '@testing-library/react';
import { createStore, Provider as JotaiProvider } from 'jotai';
import { type ReactNode } from 'react';
import { ViewFilterOperand } from 'twenty-shared/types';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';
import { getTestEnrichedObjectMetadataItemsMock } from '~/testing/utils/getTestEnrichedObjectMetadataItemsMock';
import { setTestObjectMetadataItemsInMetadataStore } from '~/testing/utils/setTestObjectMetadataItemsInMetadataStore';

const PAGE_LAYOUT_ID = 'page-layout-id';
const WIDGET_ID = 'widget-id';
const INVERSE_FIELD_METADATA_ID = 'inverse-field-metadata-id';
const RELATION_TARGET_FIELD_METADATA_ID = 'relation-target-field-metadata-id';

const opportunityObjectMetadataItem =
  getMockObjectMetadataItemOrThrow('opportunity');

const getWrapper =
  (store: ReturnType<typeof createStore>) =>
  ({ children }: { children: ReactNode }) => (
    <JotaiProvider store={store}>{children}</JotaiProvider>
  );

describe('useAddDraftViewForFieldRelationTableWidget', () => {
  it('should seed a relation traversal filter for a nested relation widget', () => {
    const store = createStore();

    setTestObjectMetadataItemsInMetadataStore(
      store,
      getTestEnrichedObjectMetadataItemsMock(),
    );

    const { result } = renderHook(
      () => useAddDraftViewForFieldRelationTableWidget(PAGE_LAYOUT_ID),
      { wrapper: getWrapper(store) },
    );

    let viewId: string | undefined;

    act(() => {
      viewId = result.current.addDraftViewForFieldRelationTableWidget({
        widgetId: WIDGET_ID,
        targetObjectMetadataId: opportunityObjectMetadataItem.id,
        inverseFieldMetadataId: INVERSE_FIELD_METADATA_ID,
        relationTargetFieldMetadataId: RELATION_TARGET_FIELD_METADATA_ID,
      });
    });

    const draft = store.get(
      recordTableWidgetViewDraftComponentState.atomFamily({
        instanceId: PAGE_LAYOUT_ID,
      }),
    );

    expect(viewId).toBeDefined();
    expect(draft[WIDGET_ID].view.objectMetadataId).toBe(
      opportunityObjectMetadataItem.id,
    );
    expect(draft[WIDGET_ID].viewFilters).toEqual([
      expect.objectContaining({
        fieldMetadataId: INVERSE_FIELD_METADATA_ID,
        relationTargetFieldMetadataId: RELATION_TARGET_FIELD_METADATA_ID,
        operand: ViewFilterOperand.IS,
        value: JSON.stringify({
          selectedRecordIds: [],
          isCurrentRecordSelected: true,
        }),
      }),
    ]);
  });

  it('should seed a direct filter without relation traversal by default', () => {
    const store = createStore();

    setTestObjectMetadataItemsInMetadataStore(
      store,
      getTestEnrichedObjectMetadataItemsMock(),
    );

    const { result } = renderHook(
      () => useAddDraftViewForFieldRelationTableWidget(PAGE_LAYOUT_ID),
      { wrapper: getWrapper(store) },
    );

    act(() => {
      result.current.addDraftViewForFieldRelationTableWidget({
        widgetId: WIDGET_ID,
        targetObjectMetadataId: opportunityObjectMetadataItem.id,
        inverseFieldMetadataId: INVERSE_FIELD_METADATA_ID,
      });
    });

    const draft = store.get(
      recordTableWidgetViewDraftComponentState.atomFamily({
        instanceId: PAGE_LAYOUT_ID,
      }),
    );

    expect(draft[WIDGET_ID].viewFilters).toEqual([
      expect.objectContaining({
        fieldMetadataId: INVERSE_FIELD_METADATA_ID,
        relationTargetFieldMetadataId: null,
      }),
    ]);
  });
});
