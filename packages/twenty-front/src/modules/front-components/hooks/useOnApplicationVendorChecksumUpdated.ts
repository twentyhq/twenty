import { useListenToMetadataOperationBrowserEvent } from '@/browser-event/hooks/useListenToMetadataOperationBrowserEvent';
import { useUpdateApplicationVendorChecksumApolloCache } from '@/front-components/hooks/useUpdateApplicationVendorChecksumApolloCache';
import { type ApplicationVendorChecksumBroadcastRecord } from '@/front-components/types/ApplicationVendorChecksumBroadcastRecord';

type UseOnApplicationVendorChecksumUpdatedArgs = {
  applicationId?: string;
  skip?: boolean;
};

export const useOnApplicationVendorChecksumUpdated = ({
  applicationId,
  skip = false,
}: UseOnApplicationVendorChecksumUpdatedArgs) => {
  const { updateApplicationVendorChecksumApolloCache } =
    useUpdateApplicationVendorChecksumApolloCache({
      applicationId,
    });

  useListenToMetadataOperationBrowserEvent<ApplicationVendorChecksumBroadcastRecord>(
    {
      metadataName: 'application',
      onMetadataOperationBrowserEvent:
        updateApplicationVendorChecksumApolloCache,
      skip,
    },
  );
};
