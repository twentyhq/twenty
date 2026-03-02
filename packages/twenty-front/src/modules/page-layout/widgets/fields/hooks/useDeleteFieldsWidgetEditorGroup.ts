import { fieldsWidgetGroupsDraftComponentState } from '@/page-layout/states/fieldsWidgetGroupsDraftComponentState';
import { fieldsWidgetModeDraftComponentState } from '@/page-layout/states/fieldsWidgetModeDraftComponentState';
import { fieldsWidgetUngroupedFieldsDraftComponentState } from '@/page-layout/states/fieldsWidgetUngroupedFieldsDraftComponentState';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';
import { useStore } from 'jotai';
import { useCallback } from 'react';

type UseDeleteFieldsWidgetEditorGroupParams = {
  pageLayoutId: string;
  widgetId: string;
};

export const useDeleteFieldsWidgetEditorGroup = ({
  pageLayoutId,
  widgetId,
}: UseDeleteFieldsWidgetEditorGroupParams) => {
  const fieldsWidgetGroupsDraftState = useAtomComponentStateCallbackState(
    fieldsWidgetGroupsDraftComponentState,
    pageLayoutId,
  );

  const fieldsWidgetUngroupedFieldsDraftState =
    useAtomComponentStateCallbackState(
      fieldsWidgetUngroupedFieldsDraftComponentState,
      pageLayoutId,
    );

  const fieldsWidgetModeDraftState = useAtomComponentStateCallbackState(
    fieldsWidgetModeDraftComponentState,
    pageLayoutId,
  );

  const store = useStore();

  const deleteGroup = useCallback(
    (groupId: string) => {
      const allDraftGroups = store.get(fieldsWidgetGroupsDraftState);

      const currentGroups = allDraftGroups[widgetId] ?? [];

      const deletedGroup = currentGroups.find((group) => group.id === groupId);

      if (!deletedGroup) {
        return;
      }

      const deletedGroupFields = deletedGroup.fields;
      const remainingGroups = currentGroups.filter(
        (group) => group.id !== groupId,
      );

      if (remainingGroups.length === 0) {
        // No groups left: switch to ungrouped mode
        store.set(fieldsWidgetGroupsDraftState, (prev) => ({
          ...prev,
          [widgetId]: [],
        }));

        store.set(fieldsWidgetUngroupedFieldsDraftState, (prev) => ({
          ...prev,
          [widgetId]: deletedGroupFields.map((field, index) => ({
            ...field,
            position: index,
            globalIndex: index,
          })),
        }));

        store.set(fieldsWidgetModeDraftState, (prev) => ({
          ...prev,
          [widgetId]: 'ungrouped' as const,
        }));

        return;
      }

      // Find the next or previous group to absorb the deleted group's fields
      const sortedRemaining = [...remainingGroups].sort(
        (a, b) => a.position - b.position,
      );

      const deletedGroupPosition = deletedGroup.position;

      // Find the next group (first remaining group with position > deleted group's position)
      const nextGroup = sortedRemaining.find(
        (group) => group.position > deletedGroupPosition,
      );

      // Use next group if available, otherwise use the last group (previous)
      const targetGroup =
        nextGroup ?? sortedRemaining[sortedRemaining.length - 1];

      store.set(fieldsWidgetGroupsDraftState, (prev) => ({
        ...prev,
        [widgetId]: remainingGroups.map((group) => {
          if (group.id !== targetGroup.id) {
            return group;
          }

          // Append deleted group's fields to the target group
          const existingFields = [...group.fields].sort(
            (a, b) => a.position - b.position,
          );

          const maxPosition =
            existingFields.length > 0
              ? Math.max(...existingFields.map((f) => f.position))
              : -1;

          const appendedFields = deletedGroupFields.map((field, index) => ({
            ...field,
            position: maxPosition + 1 + index,
          }));

          return {
            ...group,
            fields: [...existingFields, ...appendedFields],
          };
        }),
      }));
    },
    [
      fieldsWidgetGroupsDraftState,
      fieldsWidgetUngroupedFieldsDraftState,
      fieldsWidgetModeDraftState,
      widgetId,
      store,
    ],
  );

  return { deleteGroup };
};
