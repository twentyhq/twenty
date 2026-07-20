import { useListenToMetadataOperationBrowserEvent } from '@/browser-event/hooks/useListenToMetadataOperationBrowserEvent';
import { useUpdateSdkClientChecksumsApolloCache } from '@/front-components/hooks/useUpdateSdkClientChecksumsApolloCache';
import { type ApplicationSdkClientChecksumsBroadcastRecord } from '@/front-components/types/ApplicationSdkClientChecksumsBroadcastRecord';

type UseOnApplicationSdkClientChecksumsUpdatedArgs = {
  applicationId?: string;
};

// SDK client regeneration updates the application row, so we listen to the
// application metadata broadcast and patch the application-scoped checksums
// query cache to keep the content-addressed SDK URLs of mounted components
// fresh without a reload.
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
