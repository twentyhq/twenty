import { useListenToMetadataOperationBrowserEvent } from '@/browser-event/hooks/useListenToMetadataOperationBrowserEvent';
import { useUpdateSdkClientChecksumsApolloCache } from '@/front-components/hooks/useUpdateSdkClientChecksumsApolloCache';
import { type ApplicationSdkClientChecksumsBroadcastRecord } from '@/front-components/types/ApplicationSdkClientChecksumsBroadcastRecord';

type UseOnApplicationSdkClientChecksumsUpdatedArgs = {
  frontComponentId: string;
  applicationId?: string;
};

// SDK client regeneration updates the application row, not the frontComponent
// row, so the frontComponent metadata event never carries the new checksums.
// Listening to the application broadcast keeps the content-addressed SDK URLs
// of mounted components fresh without a reload.
export const useOnApplicationSdkClientChecksumsUpdated = ({
  frontComponentId,
  applicationId,
}: UseOnApplicationSdkClientChecksumsUpdatedArgs) => {
  const { updateSdkClientChecksumsApolloCache } =
    useUpdateSdkClientChecksumsApolloCache({
      frontComponentId,
      applicationId,
    });

  useListenToMetadataOperationBrowserEvent<ApplicationSdkClientChecksumsBroadcastRecord>(
    {
      metadataName: 'application',
      onMetadataOperationBrowserEvent: updateSdkClientChecksumsApolloCache,
    },
  );
};
