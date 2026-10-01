import { type FrontComponentChecksums } from '@/front-components/types/FrontComponentChecksums';
import { hasFrontComponentChecksumChanged } from '@/front-components/utils/hasFrontComponentChecksumChanged';
import { useApolloClient } from '@apollo/client/react';
import { useCallback } from 'react';
import {
  FindOneFrontComponentDocument,
  type FindOneFrontComponentQuery,
} from '~/generated-metadata/graphql';

type UseCheckForNewerFrontComponentSourceArgs = FrontComponentChecksums & {
  frontComponentId: string;
};

export const useCheckForNewerFrontComponentSource = ({
  frontComponentId,
  builtComponentChecksum,
  frontComponentSharedDependenciesChecksum,
}: UseCheckForNewerFrontComponentSourceArgs) => {
  const apolloClient = useApolloClient();

  const checkForNewerFrontComponentSource =
    useCallback(async (): Promise<boolean> => {
      const { data } = await apolloClient.query<FindOneFrontComponentQuery>({
        query: FindOneFrontComponentDocument,
        variables: { id: frontComponentId },
        fetchPolicy: 'network-only',
      });

      return hasFrontComponentChecksumChanged({
        previousFrontComponent: {
          builtComponentChecksum,
          frontComponentSharedDependenciesChecksum,
        },
        nextFrontComponent: data?.frontComponent,
      });
    }, [
      apolloClient,
      frontComponentId,
      builtComponentChecksum,
      frontComponentSharedDependenciesChecksum,
    ]);

  return { checkForNewerFrontComponentSource };
};
