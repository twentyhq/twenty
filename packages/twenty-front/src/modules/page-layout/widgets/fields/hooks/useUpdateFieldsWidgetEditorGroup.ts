import { fieldsWidgetGroupsDraftComponentState } from '@/page-layout/states/fieldsWidgetGroupsDraftComponentState';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';

type UpdateGroupParams = {
  groupId: string;
  name?: string;
  position?: number;
  isVisible?: boolean;
};

type UseUpdateFieldsWidgetEditorGroupParams = {
  pageLayoutId: string;
  widgetId: string;
};

export const useUpdateFieldsWidgetEditorGroup = ({
  pageLayoutId,
  widgetId,
}: UseUpdateFieldsWidgetEditorGroupParams) => {
  const fieldsWidgetGroupsDraftState = useAtomComponentStateCallbackState(
    fieldsWidgetGroupsDraftComponentState,
    pageLayoutId,
  );

  const store = useStore();

  const updateGroup = useCallback(
    ({ groupId, name, position, isVisible }: UpdateGroupParams) => {
      store.set(fieldsWidgetGroupsDraftState, (prev) => {
        const currentGroups = prev[widgetId] ?? [];

        return {
          ...prev,
          [widgetId]: currentGroups.map((group) =>
            group.id === groupId
              ? {
                  ...group,
                  ...(isDefined(name) ? { name } : {}),
                  ...(isDefined(position) ? { position } : {}),
                  ...(isDefined(isVisible) ? { isVisible } : {}),
                }
              : group,
          ),
        };
      });
    },
    [fieldsWidgetGroupsDraftState, widgetId, store],
  );

  return { updateGroup };
};
