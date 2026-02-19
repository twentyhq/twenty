import { OBJECT_RECORD_OPERATION_BROWSER_EVENT_NAME } from '@/browser-event/constants/ObjectRecordOperationBrowserEventName';
import { type ObjectRecordOperation } from '@/object-record/types/ObjectRecordOperation';
import { type ObjectRecordOperationBrowserEventDetail } from '@/browser-event/types/ObjectRecordOperationBrowserEventDetail';
import { useEffect } from 'react';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

export const useListenToObjectRecordOperationBrowserEvent = ({
  onObjectRecordOperationBrowserEvent,
  objectMetadataItemId,
  operationTypes,
}: {
  onObjectRecordOperationBrowserEvent: (
    detail: ObjectRecordOperationBrowserEventDetail,
  ) => void;
  objectMetadataItemId?: string;
  operationTypes?: ObjectRecordOperation['type'][];
}) => {
  useEffect(() => {
    const handleObjectRecordOperationEvent = (event: Event) => {
      const detail = (
        event as CustomEvent<ObjectRecordOperationBrowserEventDetail>
      ).detail;

      if (
        isDefined(objectMetadataItemId) &&
        detail.objectMetadataItem.id !== objectMetadataItemId
      ) {
        return;
      }

      if (
        isNonEmptyArray(operationTypes) &&
        !operationTypes.includes(detail.operation.type)
      ) {
        return;
      }

      onObjectRecordOperationBrowserEvent(detail);
    };

    window.addEventListener(
      OBJECT_RECORD_OPERATION_BROWSER_EVENT_NAME,
      handleObjectRecordOperationEvent,
    );

    return () => {
      window.removeEventListener(
        OBJECT_RECORD_OPERATION_BROWSER_EVENT_NAME,
        handleObjectRecordOperationEvent,
      );
    };
  }, [
    objectMetadataItemId,
    onObjectRecordOperationBrowserEvent,
    operationTypes,
  ]);
};
