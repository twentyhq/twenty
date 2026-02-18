import { type MetadataOperationBrowserEventDetail } from '@/browser-event/types/MetadataOperationBrowserEventDetail';
import { useApolloClient } from '@apollo/client';
import { isDefined } from 'twenty-shared/utils';
import {
  FindOneFrontComponentDocument,
  type FindOneFrontComponentQuery,
  type FrontComponent,
} from '~/generated-metadata/graphql';

type UseUpdateFrontComponentApolloCacheArgs = {
  frontComponentId: string;
};

export const useUpdateFrontComponentApolloCache = ({
  frontComponentId,
}: UseUpdateFrontComponentApolloCacheArgs) => {
  const apolloClient = useApolloClient();

  const updateFrontComponentApolloCache = (
    detail: MetadataOperationBrowserEventDetail<FrontComponent>,
  ) => {
    if (detail.operation.type !== 'update') {
      return;
    }

    const { updatedRecord } = detail.operation;

    if (!isDefined(updatedRecord) || updatedRecord.id !== frontComponentId) {
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
            ...updatedRecord,
          },
        };
      },
    );
  };

  return { updateFrontComponentApolloCache };
};
