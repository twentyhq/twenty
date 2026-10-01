import { hasFrontComponentChecksumChanged } from '@/front-components/utils/hasFrontComponentChecksumChanged';
import { useApolloClient } from '@apollo/client/react';
import { useCallback } from 'react';
import {
  FindOneFrontComponentDocument,
  type FindOneFrontComponentQuery,
} from '~/generated-metadata/graphql';

type UseCheckForNewerFrontComponentSourceArgs = {
  frontComponentId: string;
};

export const useCheckForNewerFrontComponentSource = ({
  frontComponentId,
}: UseCheckForNewerFrontComponentSourceArgs) => {
  const apolloClient = useApolloClient();

  const checkForNewerFrontComponentSource =
    useCallback(async (): Promise<boolean> => {
      const cachedFrontComponent =
        apolloClient.cache.readQuery<FindOneFrontComponentQuery>({
          query: FindOneFrontComponentDocument,
          variables: { id: frontComponentId },
        })?.frontComponent;

      const { data } = await apolloClient.query<FindOneFrontComponentQuery>({
        query: FindOneFrontComponentDocument,
        variables: { id: frontComponentId },
        fetchPolicy: 'network-only',
      });

      return hasFrontComponentChecksumChanged({
        previousFrontComponent: cachedFrontComponent,
        nextFrontComponent: data?.frontComponent,
      });
    }, [apolloClient, frontComponentId]);

  return { checkForNewerFrontComponentSource };
};
