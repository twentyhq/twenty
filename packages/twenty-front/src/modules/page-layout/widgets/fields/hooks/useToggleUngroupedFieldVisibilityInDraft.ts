import { fieldsWidgetUngroupedFieldsDraftComponentState } from '@/page-layout/states/fieldsWidgetUngroupedFieldsDraftComponentState';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';
import { useStore } from 'jotai';
import { useCallback } from 'react';

type UseToggleUngroupedFieldVisibilityInDraftParams = {
  pageLayoutId: string;
  widgetId: string;
};

export const useToggleUngroupedFieldVisibilityInDraft = ({
  pageLayoutId,
  widgetId,
}: UseToggleUngroupedFieldVisibilityInDraftParams) => {
  const fieldsWidgetUngroupedFieldsDraftState =
    useAtomComponentStateCallbackState(
      fieldsWidgetUngroupedFieldsDraftComponentState,
      pageLayoutId,
    );

  const store = useStore();

  const toggleFieldVisibility = useCallback(
    (fieldMetadataId: string) => {
      store.set(fieldsWidgetUngroupedFieldsDraftState, (prev) => {
        const currentFields = prev[widgetId] ?? [];

        return {
          ...prev,
          [widgetId]: currentFields.map((field) =>
            field.fieldMetadataItem.id === fieldMetadataId
              ? { ...field, isVisible: !field.isVisible }
              : field,
          ),
        };
      });
    },
    [fieldsWidgetUngroupedFieldsDraftState, widgetId, store],
  );

  return { toggleFieldVisibility };
};
