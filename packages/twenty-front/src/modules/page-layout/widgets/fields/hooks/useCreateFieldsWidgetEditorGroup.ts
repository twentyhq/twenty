import { fieldsWidgetGroupsDraftComponentState } from '@/page-layout/states/fieldsWidgetGroupsDraftComponentState';
import { fieldsWidgetModeDraftComponentState } from '@/page-layout/states/fieldsWidgetModeDraftComponentState';
import { fieldsWidgetUngroupedFieldsDraftComponentState } from '@/page-layout/states/fieldsWidgetUngroupedFieldsDraftComponentState';
import { useRecoilComponentCallbackState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackState';
import { useCallback } from 'react';
import { useRecoilCallback } from 'recoil';
import { v4 } from 'uuid';

type UseCreateFieldsWidgetEditorGroupParams = {
  pageLayoutId: string;
  widgetId: string;
};

export const useCreateFieldsWidgetEditorGroup = ({
  pageLayoutId,
  widgetId,
}: UseCreateFieldsWidgetEditorGroupParams) => {
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

  const createGroup = useRecoilCallback(
    ({ set, snapshot }) =>
      (name: string) => {
        const allModes = snapshot
          .getLoadable(fieldsWidgetModeDraftState)
          .getValue();

        const currentMode = allModes[widgetId] ?? 'ungrouped';

        const newId = v4();

        if (currentMode === 'ungrouped') {
          // Absorb all ungrouped fields into the new group
          const allUngroupedFields = snapshot
            .getLoadable(fieldsWidgetUngroupedFieldsDraftState)
            .getValue();

          const ungroupedFields = allUngroupedFields[widgetId] ?? [];

          set(fieldsWidgetGroupsDraftState, (prev) => ({
            ...prev,
            [widgetId]: [
              {
                id: newId,
                name,
                position: 0,
                isVisible: true,
                fields: ungroupedFields.map((field, index) => ({
                  ...field,
                  position: index,
                  globalIndex: index,
                })),
              },
            ],
          }));

          // Clear ungrouped fields
          set(fieldsWidgetUngroupedFieldsDraftState, (prev) => ({
            ...prev,
            [widgetId]: [],
          }));

          // Switch to grouped mode
          set(fieldsWidgetModeDraftState, (prev) => ({
            ...prev,
            [widgetId]: 'grouped' as const,
          }));
        } else {
          // Grouped mode: append a new empty group
          const allDraftGroups = snapshot
            .getLoadable(fieldsWidgetGroupsDraftState)
            .getValue();

          const currentGroups = allDraftGroups[widgetId] ?? [];
          const maxPosition = Math.max(
            ...currentGroups.map((g) => g.position),
            -1,
          );

          set(fieldsWidgetGroupsDraftState, (prev) => ({
            ...prev,
            [widgetId]: [
              ...(prev[widgetId] ?? []),
              {
                id: newId,
                name,
                position: maxPosition + 1,
                isVisible: true,
                fields: [],
              },
            ],
          }));
        }

        return newId;
      },
    [
      fieldsWidgetGroupsDraftState,
      fieldsWidgetUngroupedFieldsDraftState,
      fieldsWidgetModeDraftState,
      widgetId,
    ],
  );

  const createGroupCallback = useCallback(
    (name: string) => createGroup(name),
    [createGroup],
  );

  return { createGroup: createGroupCallback };
};
