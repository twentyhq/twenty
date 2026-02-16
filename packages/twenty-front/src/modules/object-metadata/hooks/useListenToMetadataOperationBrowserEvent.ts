import { METADATA_OPERATION_BROWSER_EVENT_NAME } from '@/object-metadata/constants/MetadataOperationBrowserEventName';
import { type MetadataOperation } from '@/object-metadata/types/MetadataOperation';
import { type MetadataOperationBrowserEventDetail } from '@/object-metadata/types/MetadataOperationBrowserEventDetail';
import { useEffect } from 'react';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

export const useListenToMetadataOperationBrowserEvent = ({
  onMetadataOperationBrowserEvent,
  metadataName,
  operationTypes,
}: {
  onMetadataOperationBrowserEvent: (
    detail: MetadataOperationBrowserEventDetail,
  ) => void;
  metadataName?: string;
  operationTypes?: MetadataOperation['type'][];
}) => {
  useEffect(() => {
    const handleMetadataOperationEvent = (event: Event) => {
      const detail = (event as CustomEvent<MetadataOperationBrowserEventDetail>)
        .detail;

      if (isDefined(metadataName) && detail.metadataName !== metadataName) {
        return;
      }

      if (
        isNonEmptyArray(operationTypes) &&
        !operationTypes.includes(detail.operation.type)
      ) {
        return;
      }

      onMetadataOperationBrowserEvent(detail);
    };

    window.addEventListener(
      METADATA_OPERATION_BROWSER_EVENT_NAME,
      handleMetadataOperationEvent,
    );

    return () => {
      window.removeEventListener(
        METADATA_OPERATION_BROWSER_EVENT_NAME,
        handleMetadataOperationEvent,
      );
    };
  }, [metadataName, onMetadataOperationBrowserEvent, operationTypes]);
};
