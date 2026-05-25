import { recordTableWidgetViewDraftComponentState } from '@/page-layout/states/recordTableWidgetViewDraftComponentState';
import { type RecordTableWidgetViewFieldItem } from '@/page-layout/widgets/record-table/types/RecordTableWidgetViewFieldItem';
import { getRecordTableWidgetDraftViewFieldClientId } from '@/page-layout/widgets/record-table/utils/getRecordTableWidgetDraftViewFieldClientId';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';

type UseReorderRecordTableWidgetFieldsParams = {
  pageLayoutId: string;
  widgetId: string;
};

export const useReorderRecordTableWidgetFields = ({
  pageLayoutId,
  widgetId,
}: UseReorderRecordTableWidgetFieldsParams) => {
  const recordTableWidgetViewDraftState = useAtomComponentStateCallbackState(
    recordTableWidgetViewDraftComponentState,
    pageLayoutId,
  );

  const store = useStore();

  const reorderRecordTableWidgetFields = useCallback(
    (
      sourceIndex: number,
      destinationIndex: number,
      visibleFieldItems: RecordTableWidgetViewFieldItem[],
    ) => {
      if (sourceIndex === destinationIndex) {
        return;
      }

      const reorderedFields = [...visibleFieldItems];
      const [movedField] = reorderedFields.splice(sourceIndex, 1);
      reorderedFields.splice(destinationIndex, 0, movedField);

      const updatedPositions = new Map(
        reorderedFields.map((fieldItem, index) => [
          fieldItem.viewField.id,
          index,
        ]),
      );

      store.set(recordTableWidgetViewDraftState, (prev) => {
        const widgetViewDraft = prev[widgetId];

        if (!isDefined(widgetViewDraft)) {
          return prev;
        }

        return {
          ...prev,
          [widgetId]: {
            ...widgetViewDraft,
            viewFields: widgetViewDraft.viewFields.map((field) => {
              const newPosition = updatedPositions.get(
                getRecordTableWidgetDraftViewFieldClientId(field),
              );

              return newPosition !== undefined
                ? { ...field, position: newPosition }
                : field;
            }),
          },
        };
      });
    },
    [store, recordTableWidgetViewDraftState, widgetId],
  );

  return { reorderRecordTableWidgetFields };
};
