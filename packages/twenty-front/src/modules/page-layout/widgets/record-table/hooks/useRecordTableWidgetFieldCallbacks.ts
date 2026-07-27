import { type RecordField } from '@/object-record/record-field/types/RecordField';
import { recordTableWidgetViewDraftComponentState } from '@/page-layout/states/recordTableWidgetViewDraftComponentState';
import { useRecordTableWidgetFieldUpdate } from '@/page-layout/widgets/record-table/hooks/useRecordTableWidgetFieldUpdate';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';
import { useStore } from 'jotai';
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

  const { handleFieldUpdated } = useRecordTableWidgetFieldUpdate({
    pageLayoutId,
    widgetId,
  });

  const handleFieldCreated = (recordField: RecordField) => {
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
              fieldMetadataId: recordField.fieldMetadataItemId,
              position: recordField.position,
              isVisible: recordField.isVisible,
              size: recordField.size,
              isActive: true,
              viewId,
              clientRecordFieldId: recordField.id,
            },
          ],
        },
      };
    });
  };

  return { handleFieldUpdated, handleFieldCreated };
};
