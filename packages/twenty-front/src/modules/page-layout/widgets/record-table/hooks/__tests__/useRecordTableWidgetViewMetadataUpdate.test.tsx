import { AggregateOperations } from '@/object-record/record-table/constants/AggregateOperations';
import { recordTableWidgetViewDraftComponentState } from '@/page-layout/states/recordTableWidgetViewDraftComponentState';
import { useRecordTableWidgetFieldUpdate } from '@/page-layout/widgets/record-table/hooks/useRecordTableWidgetFieldUpdate';
import { useUpdateRecordTableWidgetViewDraft } from '@/page-layout/widgets/record-table/hooks/useUpdateRecordTableWidgetViewDraft';
import { buildRecordTableWidgetViewSnapshot } from '@/page-layout/widgets/record-table/utils/buildRecordTableWidgetViewSnapshot';
import { act, renderHook } from '@testing-library/react';
import { createStore, Provider as JotaiProvider } from 'jotai';
import { type ReactNode } from 'react';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';
import { MAIN_CONTEXT_STORE_INSTANCE_ID } from '@/context-store/constants/MainContextStoreInstanceId';

const PAGE_LAYOUT_ID = 'page-layout-id';
const WIDGET_ID = 'widget-id';

const getWrapper =
  (store: ReturnType<typeof createStore>) =>
  ({ children }: { children: ReactNode }) => (
    <JotaiProvider store={store}>{children}</JotaiProvider>
  );

const initializeDraft = (store: ReturnType<typeof createStore>) => {
  const snapshot = buildRecordTableWidgetViewSnapshot(
    getMockObjectMetadataItemOrThrow('company'),
  );

  store.set(
    recordTableWidgetViewDraftComponentState.atomFamily({
      instanceId: PAGE_LAYOUT_ID,
      surfaceId: MAIN_CONTEXT_STORE_INSTANCE_ID,
    }),
    { [WIDGET_ID]: snapshot },
  );

  return snapshot;
};

const getDraft = (store: ReturnType<typeof createStore>) =>
  store.get(
    recordTableWidgetViewDraftComponentState.atomFamily({
      instanceId: PAGE_LAYOUT_ID,
      surfaceId: MAIN_CONTEXT_STORE_INSTANCE_ID,
    }),
  )[WIDGET_ID];

describe('record table widget view metadata updates', () => {
  it('updates a column width in the widget draft', () => {
    const store = createStore();
    const snapshot = initializeDraft(store);
    const viewField = snapshot.viewFields[0];

    const { result } = renderHook(
      () =>
        useRecordTableWidgetFieldUpdate({
          pageLayoutId: PAGE_LAYOUT_ID,
          widgetId: WIDGET_ID,
        }),
      { wrapper: getWrapper(store) },
    );

    act(() => {
      result.current.handleFieldUpdated(viewField.id ?? '', { size: 320 });
    });

    expect(getDraft(store).viewFields[0].size).toBe(320);
  });

  it('updates kanban width and aggregate settings in the widget draft', () => {
    const store = createStore();
    initializeDraft(store);

    const { result } = renderHook(
      () =>
        useUpdateRecordTableWidgetViewDraft({
          pageLayoutId: PAGE_LAYOUT_ID,
          widgetId: WIDGET_ID,
        }),
      { wrapper: getWrapper(store) },
    );

    act(() => {
      result.current.updateRecordTableWidgetViewDraft({
        kanbanColumnWidth: 360,
        kanbanAggregateOperation: AggregateOperations.SUM,
        kanbanAggregateOperationFieldMetadataId: 'field-metadata-id',
      });
    });

    expect(getDraft(store).view).toEqual(
      expect.objectContaining({
        kanbanColumnWidth: 360,
        kanbanAggregateOperation: AggregateOperations.SUM,
        kanbanAggregateOperationFieldMetadataId: 'field-metadata-id',
      }),
    );
  });
});
