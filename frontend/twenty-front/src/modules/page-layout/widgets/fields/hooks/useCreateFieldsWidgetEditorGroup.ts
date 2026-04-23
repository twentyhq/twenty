import { fieldsWidgetEditorModeDraftComponentState } from '@/page-layout/states/fieldsWidgetEditorModeDraftComponentState';
import { fieldsWidgetGroupsDraftComponentState } from '@/page-layout/states/fieldsWidgetGroupsDraftComponentState';
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

  const fieldsWidgetEditorModeDraftState = useAtomComponentStateCallbackState(
    fieldsWidgetEditorModeDraftComponentState,
    pageLayoutId,
  );

  const store = useStore();

  const createGroup = useCallback(
    ({ name, afterGroupId }: { name: string; afterGroupId?: string }) => {
      const allEditorModes = store.get(fieldsWidgetEditorModeDraftState);

      const currentEditorMode = allEditorModes[widgetId] ?? 'ungrouped';

      const newId = v4();

      if (currentEditorMode === 'ungrouped') {
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

        store.set(fieldsWidgetUngroupedFieldsDraftState, (prev) => ({
          ...prev,
          [widgetId]: [],
        }));

        store.set(fieldsWidgetEditorModeDraftState, (prev) => ({
          ...prev,
          [widgetId]: 'grouped' as const,
        }));
      } else {
        const allDraftGroups = store.get(fieldsWidgetGroupsDraftState);

        const currentGroups = allDraftGroups[widgetId] ?? [];

        const afterGroup = afterGroupId
          ? currentGroups.find((g) => g.id === afterGroupId)
          : undefined;

        const newPosition =
          afterGroup !== undefined
            ? afterGroup.position + 1
            : Math.max(...currentGroups.map((g) => g.position), -1) + 1;

        const shiftedGroups =
          afterGroup !== undefined
            ? currentGroups.map((g) =>
                g.position >= newPosition
                  ? { ...g, position: g.position + 1 }
                  : g,
              )
            : currentGroups;

        store.set(fieldsWidgetGroupsDraftState, (prev) => ({
          ...prev,
          [widgetId]: [
            ...shiftedGroups,
            {
              id: newId,
              name,
              position: newPosition,
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
      fieldsWidgetEditorModeDraftState,
      widgetId,
      store,
    ],
  );

  return { createGroup };
};
