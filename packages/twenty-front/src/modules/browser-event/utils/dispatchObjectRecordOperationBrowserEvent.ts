import { OBJECT_RECORD_OPERATION_BROWSER_EVENT_NAME } from '@/browser-event/constants/ObjectRecordOperationBrowserEventName';
import { type ObjectRecordOperationBrowserEventDetail } from '@/browser-event/types/ObjectRecordOperationBrowserEventDetail';

export const dispatchObjectRecordOperationBrowserEvent = (
  detail: ObjectRecordOperationBrowserEventDetail,
) => {
  window.dispatchEvent(
    new CustomEvent(OBJECT_RECORD_OPERATION_BROWSER_EVENT_NAME, {
      detail,
    }),
  );
};
