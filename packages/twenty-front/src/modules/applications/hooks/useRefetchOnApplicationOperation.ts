import { useListenToMetadataOperationBrowserEvent } from '@/browser-event/hooks/useListenToMetadataOperationBrowserEvent';
import { type MetadataOperationBrowserEventDetail } from '@/browser-event/types/MetadataOperationBrowserEventDetail';
import { type FlatApplication } from '@/metadata-store/types/FlatApplication';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';

const QUERY_ONLY_APPLICATION_FIELDS = ['logo'];

type UseRefetchOnApplicationLifecycleSettledArgs = {
  applicationId?: string;
  refetch: () => void;
};

export const useRefetchOnApplicationOperation = ({
  applicationId,
  refetch,
}: UseRefetchOnApplicationLifecycleSettledArgs) => {
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

      const hasChangedQueryOnlyField = updatedFields.some((updatedField) =>
        QUERY_ONLY_APPLICATION_FIELDS.includes(updatedField),
      );

      if (operation.type !== 'create' && !hasChangedQueryOnlyField) {
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
