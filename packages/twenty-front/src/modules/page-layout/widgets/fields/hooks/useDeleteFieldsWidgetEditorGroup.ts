import { fieldsWidgetGroupsDraftComponentState } from '@/page-layout/states/fieldsWidgetGroupsDraftComponentState';
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

  const deleteGroupRecoilCallback = useRecoilCallback(
    ({ set }) =>
      (groupId: string) => {
        set(fieldsWidgetGroupsDraftState, (prev) => ({
          ...prev,
          [widgetId]: (prev[widgetId] ?? []).filter(
            (group) => group.id !== groupId,
          ),
        }));
      },
    [fieldsWidgetGroupsDraftState, widgetId],
  );

  const deleteGroup = useCallback(
    (groupId: string) => deleteGroupRecoilCallback(groupId),
    [deleteGroupRecoilCallback],
  );

  return { deleteGroup };
};
