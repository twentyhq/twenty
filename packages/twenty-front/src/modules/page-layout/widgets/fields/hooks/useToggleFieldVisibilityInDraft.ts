import { fieldsWidgetGroupsDraftComponentState } from '@/page-layout/states/fieldsWidgetGroupsDraftComponentState';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';
import { useStore } from 'jotai';
import { useCallback } from 'react';

type UseToggleFieldVisibilityInDraftParams = {
  pageLayoutId: string;
  widgetId: string;
};

export const useToggleFieldVisibilityInDraft = ({
  pageLayoutId,
  widgetId,
}: UseToggleFieldVisibilityInDraftParams) => {
  const fieldsWidgetGroupsDraftState = useAtomComponentStateCallbackState(
    fieldsWidgetGroupsDraftComponentState,
    pageLayoutId,
  );

  const store = useStore();

  const toggleFieldVisibility = useCallback(
    (groupId: string, fieldMetadataId: string) => {
      store.set(fieldsWidgetGroupsDraftState, (prev) => {
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
    [fieldsWidgetGroupsDraftState, widgetId, store],
  );

  return { toggleFieldVisibility };
};
