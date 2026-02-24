import { fieldsWidgetUngroupedFieldsDraftComponentState } from '@/page-layout/states/fieldsWidgetUngroupedFieldsDraftComponentState';
import { useRecoilComponentCallbackState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackState';
import { useCallback } from 'react';
import { useRecoilCallback } from 'recoil';

type UseMoveUngroupedFieldInDraftParams = {
  pageLayoutId: string;
  widgetId: string;
};

export const useMoveUngroupedFieldInDraft = ({
  pageLayoutId,
  widgetId,
}: UseMoveUngroupedFieldInDraftParams) => {
  const fieldsWidgetUngroupedFieldsDraftState = useRecoilComponentCallbackState(
    fieldsWidgetUngroupedFieldsDraftComponentState,
    pageLayoutId,
  );

  const moveFieldRecoilCallback = useRecoilCallback(
    ({ set }) =>
      (sourceIndex: number, destinationIndex: number) => {
        set(fieldsWidgetUngroupedFieldsDraftState, (prev) => {
          const currentFields = prev[widgetId] ?? [];

          const sortedFields = [...currentFields].sort(
            (a, b) => a.position - b.position,
          );

          const [movedField] = sortedFields.splice(sourceIndex, 1);

          if (!movedField) {
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
    [fieldsWidgetUngroupedFieldsDraftState, widgetId],
  );

  const moveField = useCallback(
    (sourceIndex: number, destinationIndex: number) =>
      moveFieldRecoilCallback(sourceIndex, destinationIndex),
    [moveFieldRecoilCallback],
  );

  return { moveField };
};
