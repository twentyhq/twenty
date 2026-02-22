import { fieldsWidgetGroupsDraftComponentState } from '@/page-layout/states/fieldsWidgetGroupsDraftComponentState';
import { useRecoilComponentCallbackState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackState';
import { useCallback } from 'react';
import { useRecoilCallback } from 'recoil';
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
  const fieldsWidgetGroupsDraftState = useRecoilComponentCallbackState(
    fieldsWidgetGroupsDraftComponentState,
    pageLayoutId,
  );

  const updateGroupRecoilCallback = useRecoilCallback(
    ({ set }) =>
      ({ groupId, name, position, isVisible }: UpdateGroupParams) => {
        set(fieldsWidgetGroupsDraftState, (prev) => {
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
    [fieldsWidgetGroupsDraftState, widgetId],
  );

  const updateGroup = useCallback(
    (params: UpdateGroupParams) => updateGroupRecoilCallback(params),
    [updateGroupRecoilCallback],
  );

  return { updateGroup };
};
