import { recordTableWidgetViewDraftComponentState } from '@/page-layout/states/recordTableWidgetViewDraftComponentState';
import { type RecordTableWidgetViewSnapshot } from '@/page-layout/widgets/record-table/types/RecordTableWidgetViewSnapshot';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';

type UseUpdateRecordTableWidgetViewDraftParams = {
  pageLayoutId: string;
  widgetId: string;
};

type RecordTableWidgetViewDraftUpdate = Partial<
  Pick<
    RecordTableWidgetViewSnapshot['view'],
    | 'kanbanAggregateOperation'
    | 'kanbanAggregateOperationFieldMetadataId'
    | 'kanbanColumnWidth'
  >
>;

export const useUpdateRecordTableWidgetViewDraft = ({
  pageLayoutId,
  widgetId,
}: UseUpdateRecordTableWidgetViewDraftParams) => {
  const recordTableWidgetViewDraftState = useAtomComponentStateCallbackState(
    recordTableWidgetViewDraftComponentState,
    pageLayoutId,
  );

  const store = useStore();

  const updateRecordTableWidgetViewDraft = useCallback(
    (update: RecordTableWidgetViewDraftUpdate) => {
      store.set(recordTableWidgetViewDraftState, (previousDrafts) => {
        const widgetViewDraft = previousDrafts[widgetId];

        if (!isDefined(widgetViewDraft)) {
          return previousDrafts;
        }

        return {
          ...previousDrafts,
          [widgetId]: {
            ...widgetViewDraft,
            view: {
              ...widgetViewDraft.view,
              ...update,
            },
          },
        };
      });
    },
    [recordTableWidgetViewDraftState, store, widgetId],
  );

  return { updateRecordTableWidgetViewDraft };
};
