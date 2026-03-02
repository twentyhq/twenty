import { fieldsWidgetGroupsDraftComponentState } from '@/page-layout/states/fieldsWidgetGroupsDraftComponentState';
import { fieldsWidgetModeDraftComponentState } from '@/page-layout/states/fieldsWidgetModeDraftComponentState';
import { fieldsWidgetUngroupedFieldsDraftComponentState } from '@/page-layout/states/fieldsWidgetUngroupedFieldsDraftComponentState';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { v4 } from 'uuid';

type UseCreateFieldsWidgetEditorGroupParams = {
  pageLayoutId: string;
  widgetId: string;
};

export const useCreateFieldsWidgetEditorGroup = ({
  pageLayoutId,
  widgetId,
}: UseCreateFieldsWidgetEditorGroupParams) => {
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

  const createGroup = useCallback(
    (name: string) => {
      const allModes = store.get(fieldsWidgetModeDraftState);

      const currentMode = allModes[widgetId] ?? 'ungrouped';

      const newId = v4();

      if (currentMode === 'ungrouped') {
        // Absorb all ungrouped fields into the new group
        const allUngroupedFields = store.get(
          fieldsWidgetUngroupedFieldsDraftState,
        );

        const ungroupedFields = allUngroupedFields[widgetId] ?? [];

        store.set(fieldsWidgetGroupsDraftState, (prev) => ({
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
        store.set(fieldsWidgetUngroupedFieldsDraftState, (prev) => ({
          ...prev,
          [widgetId]: [],
        }));

        // Switch to grouped mode
        store.set(fieldsWidgetModeDraftState, (prev) => ({
          ...prev,
          [widgetId]: 'grouped' as const,
        }));
      } else {
        // Grouped mode: append a new empty group
        const allDraftGroups = store.get(fieldsWidgetGroupsDraftState);

        const currentGroups = allDraftGroups[widgetId] ?? [];
        const maxPosition = Math.max(
          ...currentGroups.map((g) => g.position),
          -1,
        );

        store.set(fieldsWidgetGroupsDraftState, (prev) => ({
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
      store,
    ],
  );

  return { createGroup };
};
