import { useListenToMetadataOperationBrowserEvent } from '@/browser-event/hooks/useListenToMetadataOperationBrowserEvent';
import { useUpdateSdkClientChecksumsApolloCache } from '@/front-components/hooks/useUpdateSdkClientChecksumsApolloCache';
import { type ApplicationSdkClientChecksumsBroadcastRecord } from '@/front-components/types/ApplicationSdkClientChecksumsBroadcastRecord';

type UseOnApplicationSdkClientChecksumsUpdatedArgs = {
  applicationId?: string;
  skip?: boolean;
};

export const useOnApplicationSdkClientChecksumsUpdated = ({
  applicationId,
  skip = false,
}: UseOnApplicationSdkClientChecksumsUpdatedArgs) => {
  const { updateSdkClientChecksumsApolloCache } =
    useUpdateSdkClientChecksumsApolloCache({
      applicationId,
    });

  useListenToMetadataOperationBrowserEvent<ApplicationSdkClientChecksumsBroadcastRecord>(
    {
      metadataName: 'application',
      onMetadataOperationBrowserEvent: updateSdkClientChecksumsApolloCache,
      skip,
    },
  );
};
