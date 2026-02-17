import { METADATA_OPERATION_BROWSER_EVENT_NAME } from '@/browser-event/constants/MetadataOperationBrowserEventName';
import { type MetadataOperationBrowserEventDetail } from '@/browser-event/types/MetadataOperationBrowserEventDetail';

export const dispatchMetadataOperationBrowserEvent = <
  T extends Record<string, unknown>,
>(
  detail: MetadataOperationBrowserEventDetail<T>,
) => {
  window.dispatchEvent(
    new CustomEvent(METADATA_OPERATION_BROWSER_EVENT_NAME, {
      detail,
    }),
  );
};
