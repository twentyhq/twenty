import { useListenToMetadataOperationBrowserEvent } from '@/browser-event/hooks/useListenToMetadataOperationBrowserEvent';
import { type MetadataOperationBrowserEventDetail } from '@/browser-event/types/MetadataOperationBrowserEventDetail';
import { type FlatApplication } from '@/metadata-store/types/FlatApplication';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';

const REFETCH_TRIGGERING_APPLICATION_FIELDS = ['logo', 'version'];

type UseRefetchOnApplicationOperationArgs = {
  applicationId?: string;
  refetch: () => void;
};

export const useRefetchOnApplicationOperation = ({
  applicationId,
  refetch,
}: UseRefetchOnApplicationOperationArgs) => {
  const onApplicationOperation = useCallback(
    ({ operation }: MetadataOperationBrowserEventDetail<FlatApplication>) => {
      if (operation.type === 'delete') {
        if (isDefined(applicationId)) {
          return;
        }

        refetch();

        return;
      }

      const application =
        operation.type === 'create'
          ? operation.createdRecord
          : operation.updatedRecord;

      if (isDefined(applicationId) && application.id !== applicationId) {
        return;
      }

      const updatedFields =
        operation.type === 'update' ? (operation.updatedFields ?? []) : [];

      const hasChangedRefetchTriggeringField = updatedFields.some(
        (updatedField) =>
          REFETCH_TRIGGERING_APPLICATION_FIELDS.includes(updatedField),
      );

      if (operation.type !== 'create' && !hasChangedRefetchTriggeringField) {
        return;
      }

      refetch();
    },
    [applicationId, refetch],
  );

  useListenToMetadataOperationBrowserEvent<FlatApplication>({
    metadataName: 'application',
    onMetadataOperationBrowserEvent: onApplicationOperation,
  });
};
