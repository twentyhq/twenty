import { fieldsWidgetGroupsDraftComponentState } from '@/page-layout/states/fieldsWidgetGroupsDraftComponentState';
import { useRecoilComponentStateCallbackStateV2 } from '@/ui/utilities/state/jotai/hooks/useRecoilComponentStateCallbackStateV2';
import { useStore } from 'jotai';
import { useCallback } from 'react';

type UseReorderFieldsWidgetEditorGroupsParams = {
  pageLayoutId: string;
  widgetId: string;
};

export const useReorderFieldsWidgetEditorGroups = ({
  pageLayoutId,
  widgetId,
}: UseReorderFieldsWidgetEditorGroupsParams) => {
  const fieldsWidgetGroupsDraftState = useRecoilComponentStateCallbackStateV2(
    fieldsWidgetGroupsDraftComponentState,
    pageLayoutId,
  );

  const store = useStore();

  const reorderGroups = useCallback(
    (reorderedGroupIds: string[]) => {
      store.set(fieldsWidgetGroupsDraftState, (prev) => {
        const currentGroups = prev[widgetId] ?? [];

        const reorderedGroups = reorderedGroupIds
          .map((groupId, index) => {
            const group = currentGroups.find((g) => g.id === groupId);

            if (!group) {
              return null;
            }

            return { ...group, position: index };
          })
          .filter((g): g is NonNullable<typeof g> => g !== null);

        return {
          ...prev,
          [widgetId]: reorderedGroups,
        };
      });
    },
    [fieldsWidgetGroupsDraftState, widgetId, store],
  );

  return { reorderGroups };
};
