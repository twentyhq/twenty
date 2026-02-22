import { fieldsWidgetGroupsDraftComponentState } from '@/page-layout/states/fieldsWidgetGroupsDraftComponentState';
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

  const createGroup = useRecoilCallback(
    ({ set, snapshot }) =>
      (name: string) => {
        const allDraftGroups = snapshot
          .getLoadable(fieldsWidgetGroupsDraftState)
          .getValue();

        const currentGroups = allDraftGroups[widgetId] ?? [];
        const maxPosition = Math.max(
          ...currentGroups.map((g) => g.position),
          -1,
        );
        const newId = v4();

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

        return newId;
      },
    [fieldsWidgetGroupsDraftState, widgetId],
  );

  const createGroupCallback = useCallback(
    (name: string) => createGroup(name),
    [createGroup],
  );

  return { createGroup: createGroupCallback };
};
