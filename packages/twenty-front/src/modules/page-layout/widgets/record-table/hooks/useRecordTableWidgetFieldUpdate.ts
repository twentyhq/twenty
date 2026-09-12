import { recordTableWidgetViewDraftComponentState } from '@/page-layout/states/recordTableWidgetViewDraftComponentState';
import { type RecordTableWidgetDraftViewField } from '@/page-layout/widgets/record-table/types/RecordTableWidgetViewSnapshot';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';

type UseRecordTableWidgetFieldUpdateParams = {
  pageLayoutId: string;
  widgetId: string;
};

type RecordTableWidgetFieldUpdate = Partial<
  Pick<
    RecordTableWidgetDraftViewField,
    'aggregateOperation' | 'isVisible' | 'position' | 'size'
  >
>;

export const useRecordTableWidgetFieldUpdate = ({
  pageLayoutId,
  widgetId,
}: UseRecordTableWidgetFieldUpdateParams) => {
  const recordTableWidgetViewDraftState = useAtomComponentStateCallbackState(
    recordTableWidgetViewDraftComponentState,
    pageLayoutId,
  );

  const store = useStore();

  const handleFieldUpdated = useCallback(
    (viewFieldId: string, update: RecordTableWidgetFieldUpdate) => {
      store.set(recordTableWidgetViewDraftState, (prev) => {
        const widgetViewDraft = prev[widgetId];

        if (!isDefined(widgetViewDraft)) {
          return prev;
        }

        return {
          ...prev,
          [widgetId]: {
            ...widgetViewDraft,
            viewFields: widgetViewDraft.viewFields.map((field) =>
              field.id === viewFieldId ||
              field.clientRecordFieldId === viewFieldId
                ? { ...field, ...update }
                : field,
            ),
          },
        };
      });
    },
    [recordTableWidgetViewDraftState, store, widgetId],
  );

  return { handleFieldUpdated };
};
