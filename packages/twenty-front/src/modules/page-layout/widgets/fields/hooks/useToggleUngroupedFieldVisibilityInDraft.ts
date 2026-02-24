import { fieldsWidgetUngroupedFieldsDraftComponentState } from '@/page-layout/states/fieldsWidgetUngroupedFieldsDraftComponentState';
import { useRecoilComponentCallbackState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackState';
import { useCallback } from 'react';
import { useRecoilCallback } from 'recoil';

type UseToggleUngroupedFieldVisibilityInDraftParams = {
  pageLayoutId: string;
  widgetId: string;
};

export const useToggleUngroupedFieldVisibilityInDraft = ({
  pageLayoutId,
  widgetId,
}: UseToggleUngroupedFieldVisibilityInDraftParams) => {
  const fieldsWidgetUngroupedFieldsDraftState = useRecoilComponentCallbackState(
    fieldsWidgetUngroupedFieldsDraftComponentState,
    pageLayoutId,
  );

  const toggleFieldVisibilityRecoilCallback = useRecoilCallback(
    ({ set }) =>
      (fieldMetadataId: string) => {
        set(fieldsWidgetUngroupedFieldsDraftState, (prev) => {
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
    [fieldsWidgetUngroupedFieldsDraftState, widgetId],
  );

  const toggleFieldVisibility = useCallback(
    (fieldMetadataId: string) =>
      toggleFieldVisibilityRecoilCallback(fieldMetadataId),
    [toggleFieldVisibilityRecoilCallback],
  );

  return { toggleFieldVisibility };
};
