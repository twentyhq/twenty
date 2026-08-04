import { type MetadataOperationBrowserEventDetail } from '@/browser-event/types/MetadataOperationBrowserEventDetail';
import { type ApplicationVendorChecksumBroadcastRecord } from '@/front-components/types/ApplicationVendorChecksumBroadcastRecord';
import { useApolloClient } from '@apollo/client/react';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';
import {
  GetApplicationVendorChecksumDocument,
  type GetApplicationVendorChecksumQuery,
} from '~/generated-metadata/graphql';

type UseUpdateApplicationVendorChecksumApolloCacheArgs = {
  applicationId?: string;
};

export const useUpdateApplicationVendorChecksumApolloCache = ({
  applicationId,
}: UseUpdateApplicationVendorChecksumApolloCacheArgs) => {
  const apolloClient = useApolloClient();

  const updateApplicationVendorChecksumApolloCache = useCallback(
    (
      detail: MetadataOperationBrowserEventDetail<ApplicationVendorChecksumBroadcastRecord>,
    ) => {
      if (detail.operation.type !== 'update') {
        return;
      }

      const { updatedRecord } = detail.operation;

      if (!isDefined(applicationId) || updatedRecord.id !== applicationId) {
        return;
      }

      const { vendorChecksum } = updatedRecord;

      if (!isDefined(vendorChecksum)) {
        return;
      }

      apolloClient.cache.updateQuery<GetApplicationVendorChecksumQuery>(
        {
          query: GetApplicationVendorChecksumDocument,
          variables: { applicationId },
        },
        () => ({ applicationVendorChecksum: vendorChecksum }),
      );
    },
    [apolloClient, applicationId],
  );

  return { updateApplicationVendorChecksumApolloCache };
};
