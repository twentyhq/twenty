import { METADATA_OPERATION_BROWSER_EVENT_NAME } from '@/object-metadata/constants/MetadataOperationBrowserEventName';
import { type MetadataOperationBrowserEventDetail } from '@/object-metadata/types/MetadataOperationBrowserEventDetail';

export const dispatchMetadataOperationBrowserEvent = (
  detail: MetadataOperationBrowserEventDetail,
) => {
  window.dispatchEvent(
    new CustomEvent(METADATA_OPERATION_BROWSER_EVENT_NAME, {
      detail,
    }),
  );
};
