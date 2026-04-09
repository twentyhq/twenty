import { METADATA_OPERATION_BROWSER_EVENT_NAME } from '@/browser-event/constants/MetadataOperationBrowserEventName';
import { type MetadataOperation } from '@/browser-event/types/MetadataOperation';
import { type MetadataOperationBrowserEventDetail } from '@/browser-event/types/MetadataOperationBrowserEventDetail';
import { useEffect } from 'react';
import { type AllMetadataName } from 'twenty-shared/metadata';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

export const useListenToMetadataOperationBrowserEvent = <
  T extends Record<string, unknown>,
>({
  onMetadataOperationBrowserEvent,
  metadataName,
  operationTypes,
}: {
  onMetadataOperationBrowserEvent: (
    detail: MetadataOperationBrowserEventDetail<T>,
  ) => void;
  metadataName?: AllMetadataName;
  operationTypes?: MetadataOperation<T>['type'][];
}) => {
  useEffect(() => {
    const handleMetadataOperationEvent = (
      event: CustomEvent<MetadataOperationBrowserEventDetail<T>>,
    ) => {
      const detail = event.detail;

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
      handleMetadataOperationEvent as EventListener,
    );

    return () => {
      window.removeEventListener(
        METADATA_OPERATION_BROWSER_EVENT_NAME,
        handleMetadataOperationEvent as EventListener,
      );
    };
  }, [metadataName, onMetadataOperationBrowserEvent, operationTypes]);
};
