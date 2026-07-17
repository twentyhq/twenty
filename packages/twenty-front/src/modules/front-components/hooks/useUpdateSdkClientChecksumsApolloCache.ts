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

    const { sdkClientCoreChecksum, sdkClientMetadataChecksum } = updatedRecord;

    if (
      !isDefined(sdkClientCoreChecksum) ||
      !isDefined(sdkClientMetadataChecksum)
    ) {
      return;
    }

    apolloClient.cache.updateQuery<FindOneFrontComponentQuery>(
      {
        query: FindOneFrontComponentDocument,
        variables: { id: frontComponentId },
      },
      (existingData) => {
        if (!isDefined(existingData?.frontComponent)) {
          return existingData;
        }

        return {
          ...existingData,
          frontComponent: {
            ...existingData.frontComponent,
            sdkClientChecksums: {
              __typename: 'SdkClientChecksums' as const,
              core: sdkClientCoreChecksum,
              metadata: sdkClientMetadataChecksum,
            },
          },
        };
      },
    );
  };

  return { updateSdkClientChecksumsApolloCache };
};
