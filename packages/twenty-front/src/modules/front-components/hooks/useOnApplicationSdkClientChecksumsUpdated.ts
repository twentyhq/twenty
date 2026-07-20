import { useListenToMetadataOperationBrowserEvent } from '@/browser-event/hooks/useListenToMetadataOperationBrowserEvent';
import { useUpdateSdkClientChecksumsApolloCache } from '@/front-components/hooks/useUpdateSdkClientChecksumsApolloCache';
import { type ApplicationSdkClientChecksumsBroadcastRecord } from '@/front-components/types/ApplicationSdkClientChecksumsBroadcastRecord';

type UseOnApplicationSdkClientChecksumsUpdatedArgs = {
  applicationId?: string;
};

export const useOnApplicationSdkClientChecksumsUpdated = ({
  applicationId,
}: UseOnApplicationSdkClientChecksumsUpdatedArgs) => {
  const { updateSdkClientChecksumsApolloCache } =
    useUpdateSdkClientChecksumsApolloCache({
      applicationId,
    });

  useListenToMetadataOperationBrowserEvent<ApplicationSdkClientChecksumsBroadcastRecord>(
    {
      metadataName: 'application',
      onMetadataOperationBrowserEvent: updateSdkClientChecksumsApolloCache,
    },
  );
};
