import { fieldsWidgetGroupsDraftComponentState } from '@/page-layout/states/fieldsWidgetGroupsDraftComponentState';
import { fieldsWidgetModeDraftComponentState } from '@/page-layout/states/fieldsWidgetModeDraftComponentState';
import { fieldsWidgetUngroupedFieldsDraftComponentState } from '@/page-layout/states/fieldsWidgetUngroupedFieldsDraftComponentState';
import { useRecoilComponentCallbackState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackState';
import { useCallback } from 'react';
import { useRecoilCallback } from 'recoil';

type UseDeleteFieldsWidgetEditorGroupParams = {
  pageLayoutId: string;
  widgetId: string;
};

export const useDeleteFieldsWidgetEditorGroup = ({
  pageLayoutId,
  widgetId,
}: UseDeleteFieldsWidgetEditorGroupParams) => {
  const fieldsWidgetGroupsDraftState = useRecoilComponentCallbackState(
    fieldsWidgetGroupsDraftComponentState,
    pageLayoutId,
  );

  const fieldsWidgetUngroupedFieldsDraftState = useRecoilComponentCallbackState(
    fieldsWidgetUngroupedFieldsDraftComponentState,
    pageLayoutId,
  );

  const fieldsWidgetModeDraftState = useRecoilComponentCallbackState(
    fieldsWidgetModeDraftComponentState,
    pageLayoutId,
  );

  const deleteGroupRecoilCallback = useRecoilCallback(
    ({ set, snapshot }) =>
      (groupId: string) => {
        const allDraftGroups = snapshot
          .getLoadable(fieldsWidgetGroupsDraftState)
          .getValue();

        const currentGroups = allDraftGroups[widgetId] ?? [];

        const deletedGroup = currentGroups.find(
          (group) => group.id === groupId,
        );

        if (!deletedGroup) {
          return;
        }

        const deletedGroupFields = deletedGroup.fields;
        const remainingGroups = currentGroups.filter(
          (group) => group.id !== groupId,
        );

        if (remainingGroups.length === 0) {
          // No groups left: switch to ungrouped mode
          set(fieldsWidgetGroupsDraftState, (prev) => ({
            ...prev,
            [widgetId]: [],
          }));

          set(fieldsWidgetUngroupedFieldsDraftState, (prev) => ({
            ...prev,
            [widgetId]: deletedGroupFields.map((field, index) => ({
              ...field,
              position: index,
              globalIndex: index,
            })),
          }));

          set(fieldsWidgetModeDraftState, (prev) => ({
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

        set(fieldsWidgetGroupsDraftState, (prev) => ({
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
    ],
  );

  const deleteGroup = useCallback(
    (groupId: string) => deleteGroupRecoilCallback(groupId),
    [deleteGroupRecoilCallback],
  );

  return { deleteGroup };
};
