import { OBJECT_RECORD_OPERATION_BROWSER_EVENT_NAME } from '@/object-record/constants/ObjectRecordOperationBrowserEventName';
import { type ObjectRecordOperationBrowserEventDetail } from '@/object-record/types/ObjectRecordOperationBrowserEventDetail';

export const dispatchObjectRecordOperationBrowserEvent = (
  detail: ObjectRecordOperationBrowserEventDetail,
) => {
  window.dispatchEvent(
    new CustomEvent(OBJECT_RECORD_OPERATION_BROWSER_EVENT_NAME, {
      detail,
    }),
  );
};
