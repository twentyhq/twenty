import { fieldsWidgetGroupsDraftComponentState } from '@/page-layout/states/fieldsWidgetGroupsDraftComponentState';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';
import { useStore } from 'jotai';
import { useCallback } from 'react';

type UseMoveFieldInDraftParams = {
  pageLayoutId: string;
  widgetId: string;
};

export const useMoveFieldInDraft = ({
  pageLayoutId,
  widgetId,
}: UseMoveFieldInDraftParams) => {
  const fieldsWidgetGroupsDraftState = useAtomComponentStateCallbackState(
    fieldsWidgetGroupsDraftComponentState,
    pageLayoutId,
  );

  const store = useStore();

  const moveField = useCallback(
    (
      sourceGroupId: string,
      destinationGroupId: string,
      sourceIndex: number,
      destinationIndex: number,
    ) => {
      store.set(fieldsWidgetGroupsDraftState, (prev) => {
        const currentGroups = prev[widgetId] ?? [];

        const sourceGroup = currentGroups.find((g) => g.id === sourceGroupId);

        if (!sourceGroup) {
          return prev;
        }

        const sortedSourceFields = [...sourceGroup.fields].sort(
          (a, b) => a.position - b.position,
        );

        const [movedField] = sortedSourceFields.splice(sourceIndex, 1);

        if (!movedField) {
          return prev;
        }

        if (sourceGroupId === destinationGroupId) {
          sortedSourceFields.splice(destinationIndex, 0, movedField);

          const updatedFields = sortedSourceFields.map((field, index) => ({
            ...field,
            position: index,
          }));

          return {
            ...prev,
            [widgetId]: currentGroups.map((group) =>
              group.id === sourceGroupId
                ? { ...group, fields: updatedFields }
                : group,
            ),
          };
        }

        const destinationGroup = currentGroups.find(
          (g) => g.id === destinationGroupId,
        );

        if (!destinationGroup) {
          return prev;
        }

        const updatedSourceFields = sortedSourceFields.map((field, index) => ({
          ...field,
          position: index,
        }));

        const sortedDestFields = [...destinationGroup.fields].sort(
          (a, b) => a.position - b.position,
        );
        sortedDestFields.splice(destinationIndex, 0, movedField);

        const updatedDestFields = sortedDestFields.map((field, index) => ({
          ...field,
          position: index,
        }));

        return {
          ...prev,
          [widgetId]: currentGroups.map((group) => {
            if (group.id === sourceGroupId) {
              return { ...group, fields: updatedSourceFields };
            }

            if (group.id === destinationGroupId) {
              return { ...group, fields: updatedDestFields };
            }

            return group;
          }),
        };
      });
    },
    [fieldsWidgetGroupsDraftState, widgetId, store],
  );

  return { moveField };
};
