import { currentRecordSortsComponentState } from '@/object-record/record-sort/states/currentRecordSortsComponentState';
import { recordTableWidgetViewDraftComponentState } from '@/page-layout/states/recordTableWidgetViewDraftComponentState';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';
import { useStore } from 'jotai';
import { isDefined } from 'twenty-shared/utils';

type UseRecordTableWidgetSortCallbacksParams = {
  pageLayoutId: string;
  widgetId: string;
  viewId: string;
  recordIndexId: string;
};

export const useRecordTableWidgetSortCallbacks = ({
  pageLayoutId,
  widgetId,
  viewId,
  recordIndexId,
}: UseRecordTableWidgetSortCallbacksParams) => {
  const recordTableWidgetViewDraftState = useAtomComponentStateCallbackState(
    recordTableWidgetViewDraftComponentState,
    pageLayoutId,
  );

  const currentRecordSortsState = useAtomComponentStateCallbackState(
    currentRecordSortsComponentState,
    recordIndexId,
  );

  const store = useStore();

  const handleSortUpdate = () => {
    const currentRecordSorts = store.get(currentRecordSortsState);

    store.set(recordTableWidgetViewDraftState, (prev) => {
      const widgetViewDraft = prev[widgetId];

      if (!isDefined(widgetViewDraft)) {
        return prev;
      }

      return {
        ...prev,
        [widgetId]: {
          ...widgetViewDraft,
          viewSorts: currentRecordSorts.map((recordSort) => ({
            id: recordSort.id,
            fieldMetadataId: recordSort.fieldMetadataId,
            direction: recordSort.direction,
            viewId,
          })),
        },
      };
    });
  };

  return { handleSortUpdate };
};
