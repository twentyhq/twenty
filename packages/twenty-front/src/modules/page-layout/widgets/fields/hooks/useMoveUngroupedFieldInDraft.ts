import { isDefined } from 'twenty-shared/utils';
import { fieldsWidgetUngroupedFieldsDraftComponentState } from '@/page-layout/states/fieldsWidgetUngroupedFieldsDraftComponentState';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';
import { useStore } from 'jotai';
import { useCallback } from 'react';

type UseMoveUngroupedFieldInDraftParams = {
  pageLayoutId: string;
  widgetId: string;
};

export const useMoveUngroupedFieldInDraft = ({
  pageLayoutId,
  widgetId,
}: UseMoveUngroupedFieldInDraftParams) => {
  const fieldsWidgetUngroupedFieldsDraftState =
    useAtomComponentStateCallbackState(
      fieldsWidgetUngroupedFieldsDraftComponentState,
      pageLayoutId,
    );

  const store = useStore();

  const moveField = useCallback(
    (sourceIndex: number, destinationIndex: number) => {
      store.set(fieldsWidgetUngroupedFieldsDraftState, (prev) => {
        const currentFields = prev[widgetId] ?? [];

        const sortedFields = [...currentFields].sort(
          (a, b) => a.position - b.position,
        );

        const [movedField] = sortedFields.splice(sourceIndex, 1);

        if (!isDefined(movedField)) {
          return prev;
        }

        sortedFields.splice(destinationIndex, 0, movedField);

        const updatedFields = sortedFields.map((field, index) => ({
          ...field,
          position: index,
          globalIndex: index,
        }));

        return {
          ...prev,
          [widgetId]: updatedFields,
        };
      });
    },
    [fieldsWidgetUngroupedFieldsDraftState, widgetId, store],
  );

  return { moveField };
};
