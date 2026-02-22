import { fieldsWidgetGroupsDraftComponentState } from '@/page-layout/states/fieldsWidgetGroupsDraftComponentState';
import { useRecoilComponentCallbackState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackState';
import { useCallback } from 'react';
import { useRecoilCallback } from 'recoil';

type UseToggleFieldVisibilityInDraftParams = {
  pageLayoutId: string;
  widgetId: string;
};

export const useToggleFieldVisibilityInDraft = ({
  pageLayoutId,
  widgetId,
}: UseToggleFieldVisibilityInDraftParams) => {
  const fieldsWidgetGroupsDraftState = useRecoilComponentCallbackState(
    fieldsWidgetGroupsDraftComponentState,
    pageLayoutId,
  );

  const toggleFieldVisibilityRecoilCallback = useRecoilCallback(
    ({ set }) =>
      (groupId: string, fieldMetadataId: string) => {
        set(fieldsWidgetGroupsDraftState, (prev) => {
          const currentGroups = prev[widgetId] ?? [];

          return {
            ...prev,
            [widgetId]: currentGroups.map((group) =>
              group.id === groupId
                ? {
                    ...group,
                    fields: group.fields.map((field) =>
                      field.fieldMetadataItem.id === fieldMetadataId
                        ? { ...field, isVisible: !field.isVisible }
                        : field,
                    ),
                  }
                : group,
            ),
          };
        });
      },
    [fieldsWidgetGroupsDraftState, widgetId],
  );

  const toggleFieldVisibility = useCallback(
    (groupId: string, fieldMetadataId: string) =>
      toggleFieldVisibilityRecoilCallback(groupId, fieldMetadataId),
    [toggleFieldVisibilityRecoilCallback],
  );

  return { toggleFieldVisibility };
};
