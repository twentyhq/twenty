import { type ApolloClient } from '@apollo/client';
import { capitalize, isDefined } from 'twenty-shared/utils';

// Links are written through the metadata API, which never updates the workspace
// cache, so the record queries currently on screen are refetched instead.
export const refetchActiveFindOneRecordQueries = async ({
  apolloCoreClient,
  objectNameSingular,
  recordId,
}: {
  apolloCoreClient: ApolloClient;
  objectNameSingular: string;
  recordId?: string;
}) => {
  await apolloCoreClient.refetchQueries({
    include: 'active',
    onQueryUpdated: (observableQuery) =>
      observableQuery.queryName ===
        `FindOne${capitalize(objectNameSingular)}` &&
      (!isDefined(recordId) ||
        observableQuery.variables.objectRecordId === recordId),
  });
};
