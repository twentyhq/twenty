import { type MetadataOperationBrowserEventDetail } from '@/browser-event/types/MetadataOperationBrowserEventDetail';
import { type ApplicationSdkClientChecksumsBroadcastRecord } from '@/front-components/types/ApplicationSdkClientChecksumsBroadcastRecord';
import { useApolloClient } from '@apollo/client/react';
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

  const updateSdkClientChecksumsApolloCache = (
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

    apolloClient.cache.updateQuery<GetApplicationSdkClientChecksumsQuery>(
      {
        query: GetApplicationSdkClientChecksumsDocument,
        variables: { applicationId },
      },
      (existingData) => {
        const existingChecksums = existingData?.applicationSdkClientChecksums;

        // The metadata checksum only ever comes from the resolver query; the
        // event carries the core checksum alone. Without an already-cached
        // pair we cannot form a valid SdkClientChecksums, so we leave the cache
        // untouched and let the next refetch populate both (the URL falls back
        // to the bare, non-content-addressed form in the meantime).
        if (!isDefined(existingChecksums)) {
          return existingData;
        }

        return {
          ...existingData,
          applicationSdkClientChecksums: {
            ...existingChecksums,
            core: sdkClientCoreChecksum,
          },
        };
      },
    );
  };

  return { updateSdkClientChecksumsApolloCache };
};
