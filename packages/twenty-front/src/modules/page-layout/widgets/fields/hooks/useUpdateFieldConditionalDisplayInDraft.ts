import { fieldsWidgetGroupsDraftComponentState } from '@/page-layout/states/fieldsWidgetGroupsDraftComponentState';
import { fieldsWidgetUngroupedFieldsDraftComponentState } from '@/page-layout/states/fieldsWidgetUngroupedFieldsDraftComponentState';
import { type FieldsWidgetGroupField } from '@/page-layout/widgets/fields/types/FieldsWidgetGroup';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { type ConditionalDisplay } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

type UseUpdateFieldConditionalDisplayInDraftParams = {
  pageLayoutId: string;
  widgetId: string;
};

export const useUpdateFieldConditionalDisplayInDraft = ({
  pageLayoutId,
  widgetId,
}: UseUpdateFieldConditionalDisplayInDraftParams) => {
  const fieldsWidgetGroupsDraftState = useAtomComponentStateCallbackState(
    fieldsWidgetGroupsDraftComponentState,
    pageLayoutId,
  );

  const fieldsWidgetUngroupedFieldsDraftState =
    useAtomComponentStateCallbackState(
      fieldsWidgetUngroupedFieldsDraftComponentState,
      pageLayoutId,
    );

  const store = useStore();

  const updateFieldConditionalDisplay = useCallback(
    (
      fieldMetadataId: string,
      conditionalDisplay: ConditionalDisplay | null,
    ) => {
      const updateField = (field: FieldsWidgetGroupField) =>
        field.fieldMetadataItem.id === fieldMetadataId
          ? { ...field, conditionalDisplay }
          : field;

      const draftGroups = store.get(fieldsWidgetGroupsDraftState)[widgetId];

      if (isDefined(draftGroups)) {
        store.set(fieldsWidgetGroupsDraftState, (prev) => ({
          ...prev,
          [widgetId]: draftGroups.map((group) => ({
            ...group,
            fields: group.fields.map(updateField),
          })),
        }));
      }

      const draftUngroupedFields = store.get(
        fieldsWidgetUngroupedFieldsDraftState,
      )[widgetId];

      if (isDefined(draftUngroupedFields)) {
        store.set(fieldsWidgetUngroupedFieldsDraftState, (prev) => ({
          ...prev,
          [widgetId]: draftUngroupedFields.map(updateField),
        }));
      }
    },
    [
      fieldsWidgetGroupsDraftState,
      fieldsWidgetUngroupedFieldsDraftState,
      widgetId,
      store,
    ],
  );

  return { updateFieldConditionalDisplay };
};
