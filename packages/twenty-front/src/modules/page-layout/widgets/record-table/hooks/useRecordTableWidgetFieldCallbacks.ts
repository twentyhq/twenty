import { type RecordField } from '@/object-record/record-field/types/RecordField';
import { recordTableWidgetViewDraftComponentState } from '@/page-layout/states/recordTableWidgetViewDraftComponentState';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';

type UseRecordTableWidgetFieldCallbacksParams = {
  pageLayoutId: string;
  widgetId: string;
  viewId: string;
};

export const useRecordTableWidgetFieldCallbacks = ({
  pageLayoutId,
  widgetId,
  viewId,
}: UseRecordTableWidgetFieldCallbacksParams) => {
  const recordTableWidgetViewDraftState = useAtomComponentStateCallbackState(
    recordTableWidgetViewDraftComponentState,
    pageLayoutId,
  );

  const store = useStore();

  const handleFieldUpdated = useCallback(
    (
      viewFieldId: string,
      update: Partial<{ position: number; isVisible: boolean }>,
    ) => {
      store.set(recordTableWidgetViewDraftState, (prev) => {
        const widgetViewDraft = prev[widgetId];

        if (!isDefined(widgetViewDraft)) {
          return prev;
        }

        return {
          ...prev,
          [widgetId]: {
            ...widgetViewDraft,
            viewFields: widgetViewDraft.viewFields.map((field) =>
              field.id === viewFieldId ? { ...field, ...update } : field,
            ),
          },
        };
      });
    },
    [store, recordTableWidgetViewDraftState, widgetId],
  );

  const handleFieldCreated = useCallback(
    (recordField: RecordField) => {
      store.set(recordTableWidgetViewDraftState, (prev) => {
        const widgetViewDraft = prev[widgetId];

        if (!isDefined(widgetViewDraft)) {
          return prev;
        }

        return {
          ...prev,
          [widgetId]: {
            ...widgetViewDraft,
            viewFields: [
              ...widgetViewDraft.viewFields,
              {
                id: recordField.id,
                fieldMetadataId: recordField.fieldMetadataItemId,
                position: recordField.position,
                isVisible: recordField.isVisible,
                size: recordField.size,
                isActive: true,
                viewId,
              },
            ],
          },
        };
      });
    },
    [store, recordTableWidgetViewDraftState, widgetId, viewId],
  );

  return { handleFieldUpdated, handleFieldCreated };
};
