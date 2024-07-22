import { useQuery } from '@apollo/client';
import { FIND_MANY_SERVERLESS_FUNCTIONS } from '@/settings/serverless-functions/graphql/queries/findManyServerlessFunctions';
import { useApolloMetadataClient } from '@/object-metadata/hooks/useApolloMetadataClient';
import { ServerlessFunctionEdge } from '~/generated-metadata/graphql';

export const useGetOneServerlessFunctions = () => {
  const apolloMetadataClient = useApolloMetadataClient();
  const { data } = useQuery(FIND_MANY_SERVERLESS_FUNCTIONS, {
    client: apolloMetadataClient ?? undefined,
  });
  return {
    serverlessFunctions:
      data?.serverlessFunctions?.edges.map(
        ({ node }: ServerlessFunctionEdge) => node,
      ) || [],
  };
};
