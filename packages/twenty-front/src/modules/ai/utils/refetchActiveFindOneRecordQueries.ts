import { type ApolloClient } from '@apollo/client';
import { capitalize } from 'twenty-shared/utils';

import { type AgentChatRecordTarget } from '@/ai/types/AgentChatRecordTarget';

// Links are written through the metadata API, which never updates the workspace
// cache, so only the record queries currently on screen can go stale.
export const refetchActiveFindOneRecordQueries = async ({
  apolloCoreClient,
  records,
}: {
  apolloCoreClient: ApolloClient;
  records: AgentChatRecordTarget[];
}) => {
  await apolloCoreClient.refetchQueries({
    include: 'active',
    onQueryUpdated: (observableQuery) =>
      records.some(
        ({ objectNameSingular, recordId }) =>
          observableQuery.queryName ===
            `FindOne${capitalize(objectNameSingular)}` &&
          observableQuery.variables.objectRecordId === recordId,
      ),
  });
};
