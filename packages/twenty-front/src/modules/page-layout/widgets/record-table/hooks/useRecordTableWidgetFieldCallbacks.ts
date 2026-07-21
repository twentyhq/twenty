import { type RecordField } from '@/object-record/record-field/types/RecordField';
import { recordTableWidgetViewDraftComponentState } from '@/page-layout/states/recordTableWidgetViewDraftComponentState';
import { type RecordTableWidgetDraftViewField } from '@/page-layout/widgets/record-table/types/RecordTableWidgetViewSnapshot';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';
import { useStore } from 'jotai';
import { isDefined } from 'twenty-shared/utils';

type UseRecordTableWidgetFieldCallbacksParams = {
  pageLayoutId: string;
  widgetId: string;
  viewId: string;
};

type UseRecordTableWidgetFieldUpdateParams = Pick<
  UseRecordTableWidgetFieldCallbacksParams,
  'pageLayoutId' | 'widgetId'
>;

type RecordTableWidgetFieldUpdate = Partial<
  Pick<
    RecordTableWidgetDraftViewField,
    'aggregateOperation' | 'isVisible' | 'position'
  >
>;

export const useRecordTableWidgetFieldUpdate = ({
  pageLayoutId,
  widgetId,
}: UseRecordTableWidgetFieldUpdateParams) => {
  const recordTableWidgetViewDraftState = useAtomComponentStateCallbackState(
    recordTableWidgetViewDraftComponentState,
    pageLayoutId,
  );

  const store = useStore();

  const handleFieldUpdated = (
    viewFieldId: string,
    update: RecordTableWidgetFieldUpdate,
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
            field.id === viewFieldId ||
            field.clientRecordFieldId === viewFieldId
              ? { ...field, ...update }
              : field,
          ),
        },
      };
    });
  };

  return { handleFieldUpdated };
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
