import { useListenToMetadataOperationBrowserEvent } from '@/object-metadata/hooks/useListenToMetadataOperationBrowserEvent';
import { type MetadataOperationBrowserEventDetail } from '@/object-metadata/types/MetadataOperationBrowserEventDetail';
import { useListenToEventsForQuery } from '@/sse-db-event/hooks/useListenToEventsForQuery';
import { useApolloClient } from '@apollo/client';
import { isNonEmptyString } from '@sniptt/guards';
import {
  AllMetadataName,
  FindOneFrontComponentDocument,
  type FindOneFrontComponentQuery,
} from '~/generated-metadata/graphql';

type UseOnFrontComponentUpdatedArgs = {
  frontComponentId: string;
};

export const useOnFrontComponentUpdated = ({
  frontComponentId,
}: UseOnFrontComponentUpdatedArgs) => {
  const queryId = `front-component-updated-${frontComponentId}`;
  const apolloClient = useApolloClient();

  useListenToEventsForQuery({
    queryId,
    operationSignature: {
      metadataName: AllMetadataName.frontComponent,
      variables: {
        filter: { id: { eq: frontComponentId } },
      },
    },
  });

  const handleFrontComponentUpdated = (
    detail: MetadataOperationBrowserEventDetail,
  ) => {
    if (detail.operation.type !== 'update') {
      return;
    }

    const newChecksum = detail.operation.updatedRecord.builtComponentChecksum;

    if (!isNonEmptyString(newChecksum)) {
      return;
    }

    apolloClient.cache.updateQuery<FindOneFrontComponentQuery>(
      {
        query: FindOneFrontComponentDocument,
        variables: { id: frontComponentId },
      },
      (existingData) => {
        if (!existingData?.frontComponent) {
          return existingData;
        }

        return {
          ...existingData,
          frontComponent: {
            ...existingData.frontComponent,
            builtComponentChecksum: newChecksum,
          },
        };
      },
    );
  };

  useListenToMetadataOperationBrowserEvent({
    metadataName: AllMetadataName.frontComponent,
    onMetadataOperationBrowserEvent: handleFrontComponentUpdated,
  });
};
