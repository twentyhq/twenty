import { fieldsWidgetGroupsDraftComponentState } from '@/page-layout/states/fieldsWidgetGroupsDraftComponentState';
import { useRecoilComponentCallbackState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackState';
import { useCallback } from 'react';
import { useRecoilCallback } from 'recoil';

type UseReorderFieldsWidgetEditorGroupsParams = {
  pageLayoutId: string;
  widgetId: string;
};

export const useReorderFieldsWidgetEditorGroups = ({
  pageLayoutId,
  widgetId,
}: UseReorderFieldsWidgetEditorGroupsParams) => {
  const fieldsWidgetGroupsDraftState = useRecoilComponentCallbackState(
    fieldsWidgetGroupsDraftComponentState,
    pageLayoutId,
  );

  const reorderGroupsRecoilCallback = useRecoilCallback(
    ({ set }) =>
      (reorderedGroupIds: string[]) => {
        set(fieldsWidgetGroupsDraftState, (prev) => {
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
    [fieldsWidgetGroupsDraftState, widgetId],
  );

  const reorderGroups = useCallback(
    (reorderedGroupIds: string[]) =>
      reorderGroupsRecoilCallback(reorderedGroupIds),
    [reorderGroupsRecoilCallback],
  );

  return { reorderGroups };
};
