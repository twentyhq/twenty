import { type MetadataOperationBrowserEventDetail } from '@/browser-event/types/MetadataOperationBrowserEventDetail';
import { type ApplicationVendorChecksumBroadcastRecord } from '@/front-components/types/ApplicationVendorChecksumBroadcastRecord';
import { useApolloClient } from '@apollo/client/react';
import { isUndefined } from '@sniptt/guards';
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

      // A removed vendor broadcasts a null checksum, which has to reach the
      // cache; only an application update carrying no checksum at all is
      // irrelevant here.
      if (isUndefined(vendorChecksum)) {
        return;
      }

      const cachedData =
        apolloClient.cache.readQuery<GetApplicationVendorChecksumQuery>({
          query: GetApplicationVendorChecksumDocument,
          variables: { applicationId },
        });

      // Writing into a cache the initial query has not populated yet would be
      // overwritten by that in-flight response, so the value is refetched
      // instead.
      if (!isDefined(cachedData)) {
        void apolloClient.query({
          query: GetApplicationVendorChecksumDocument,
          variables: { applicationId },
          fetchPolicy: 'network-only',
        });

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
