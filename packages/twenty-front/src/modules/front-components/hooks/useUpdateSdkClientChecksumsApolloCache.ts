import { type MetadataOperationBrowserEventDetail } from '@/browser-event/types/MetadataOperationBrowserEventDetail';
import { type ApplicationSdkClientChecksumsBroadcastRecord } from '@/front-components/types/ApplicationSdkClientChecksumsBroadcastRecord';
import { useApolloClient } from '@apollo/client/react';
import { isDefined } from 'twenty-shared/utils';
import {
  FindOneFrontComponentDocument,
  type FindOneFrontComponentQuery,
} from '~/generated-metadata/graphql';

type UseUpdateSdkClientChecksumsApolloCacheArgs = {
  frontComponentId: string;
  applicationId?: string;
};

export const useUpdateSdkClientChecksumsApolloCache = ({
  frontComponentId,
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

    apolloClient.cache.updateQuery<FindOneFrontComponentQuery>(
      {
        query: FindOneFrontComponentDocument,
        variables: { id: frontComponentId },
      },
      (existingData) => {
        const existingChecksums =
          existingData?.frontComponent?.sdkClientChecksums;

        // The metadata checksum only ever comes from the resolver query; the
        // event carries the core checksum alone. Without an already-cached
        // pair we cannot form a valid SdkClientChecksums, so we leave the cache
        // untouched and let the next refetch populate both (the URL falls back
        // to the bare, non-content-addressed form in the meantime).
        if (
          !isDefined(existingData?.frontComponent) ||
          !isDefined(existingChecksums)
        ) {
          return existingData;
        }

        return {
          ...existingData,
          frontComponent: {
            ...existingData.frontComponent,
            sdkClientChecksums: {
              ...existingChecksums,
              core: sdkClientCoreChecksum,
            },
          },
        };
      },
    );
  };

  return { updateSdkClientChecksumsApolloCache };
};
