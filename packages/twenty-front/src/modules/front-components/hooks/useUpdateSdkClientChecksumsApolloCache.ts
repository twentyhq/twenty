import { type MetadataOperationBrowserEventDetail } from '@/browser-event/types/MetadataOperationBrowserEventDetail';
import { type ApplicationSdkClientChecksumsBroadcastRecord } from '@/front-components/types/ApplicationSdkClientChecksumsBroadcastRecord';
import { useApolloClient } from '@apollo/client/react';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';
import {
  GetApplicationSdkClientChecksumsDocument,
  type GetApplicationSdkClientChecksumsQuery,
} from '~/generated-metadata/graphql';

type UseUpdateSdkClientChecksumsApolloCacheArgs = {
  applicationId?: string;
};

export const useUpdateSdkClientChecksumsApolloCache = ({
  applicationId,
}: UseUpdateSdkClientChecksumsApolloCacheArgs) => {
  const apolloClient = useApolloClient();

  const updateSdkClientChecksumsApolloCache = useCallback(
    (
      detail: MetadataOperationBrowserEventDetail<ApplicationSdkClientChecksumsBroadcastRecord>,
    ) => {
      if (detail.operation.type !== 'update') {
        return;
      }

      const { updatedRecord } = detail.operation;

      if (!isDefined(applicationId) || updatedRecord.id !== applicationId) {
        return;
      }

      const { sdkClientCoreChecksum } = updatedRecord;

      if (!isDefined(sdkClientCoreChecksum)) {
        return;
      }

      const cachedData =
        apolloClient.cache.readQuery<GetApplicationSdkClientChecksumsQuery>({
          query: GetApplicationSdkClientChecksumsDocument,
          variables: { applicationId },
        });

      const existingChecksums = cachedData?.applicationSdkClientChecksums;

      if (!isDefined(existingChecksums)) {
        void apolloClient.query({
          query: GetApplicationSdkClientChecksumsDocument,
          variables: { applicationId },
          fetchPolicy: 'network-only',
        });

        return;
      }

      apolloClient.cache.updateQuery<GetApplicationSdkClientChecksumsQuery>(
        {
          query: GetApplicationSdkClientChecksumsDocument,
          variables: { applicationId },
        },
        (existingData) => ({
          ...existingData,
          applicationSdkClientChecksums: {
            ...existingChecksums,
            core: sdkClientCoreChecksum,
          },
        }),
      );
    },
    [apolloClient, applicationId],
  );

  return { updateSdkClientChecksumsApolloCache };
};
