import { useListenToMetadataOperationBrowserEvent } from '@/browser-event/hooks/useListenToMetadataOperationBrowserEvent';
import { type MetadataOperation } from '@/browser-event/types/MetadataOperation';
import { type MetadataOperationBrowserEventDetail } from '@/browser-event/types/MetadataOperationBrowserEventDetail';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';

type ApplicationRegistrationBroadcastRecord = { id: string };

type UseRefetchOnApplicationRegistrationChangeArgs = {
  applicationRegistrationId?: string;
  refetch: () => void;
};

const getChangedRegistrationId = (
  operation: MetadataOperation<ApplicationRegistrationBroadcastRecord>,
): string => {
  switch (operation.type) {
    case 'create':
      return operation.createdRecord.id;
    case 'update':
      return operation.updatedRecord.id;
    case 'delete':
      return operation.deletedRecordId;
  }
};

export const useRefetchOnApplicationRegistrationChange = ({
  applicationRegistrationId,
  refetch,
}: UseRefetchOnApplicationRegistrationChangeArgs) => {
  const onApplicationRegistrationOperation = useCallback(
    ({
      operation,
    }: MetadataOperationBrowserEventDetail<ApplicationRegistrationBroadcastRecord>) => {
      if (
        isDefined(applicationRegistrationId) &&
        (getChangedRegistrationId(operation) !== applicationRegistrationId ||
          operation.type === 'delete')
      ) {
        return;
      }

      refetch();
    },
    [applicationRegistrationId, refetch],
  );

  useListenToMetadataOperationBrowserEvent<ApplicationRegistrationBroadcastRecord>(
    {
      metadataName: 'applicationRegistration',
      onMetadataOperationBrowserEvent: onApplicationRegistrationOperation,
    },
  );
};
