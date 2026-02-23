import { ApolloError, useApolloClient } from '@apollo/client';
import { type GraphQLFormattedError } from 'graphql';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { frontComponentApplicationTokenPairComponentState } from '@/front-components/states/frontComponentApplicationTokenPairComponentState';
import { useRecoilComponentState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentState';
import {
  FindOneFrontComponentDocument,
  type FindOneFrontComponentQuery,
  type FindOneFrontComponentQueryVariables,
  useRenewApplicationTokenMutation,
} from '~/generated-metadata/graphql';

const hasUnauthenticatedGraphqlError = (
  errors: ReadonlyArray<GraphQLFormattedError>,
): boolean =>
  errors.some(
    (error) =>
      error.extensions?.code === 'UNAUTHENTICATED' ||
      error.message === 'Unauthorized',
  );

type UseRequestApplicationTokenRefreshArgs = {
  frontComponentId: string;
};

export const useRequestApplicationTokenRefresh = ({
  frontComponentId,
}: UseRequestApplicationTokenRefreshArgs) => {
  const apolloClient = useApolloClient();
  const [renewApplicationToken] = useRenewApplicationTokenMutation();

  const [applicationTokenPair, setApplicationTokenPair] =
    useRecoilComponentState(
      frontComponentApplicationTokenPairComponentState,
      frontComponentId,
    );

  const requestAccessTokenRefresh = useCallback(async (): Promise<string> => {
    const refetchApplicationAccessToken = async (): Promise<string> => {
      const refetchResult = await apolloClient.query<
        FindOneFrontComponentQuery,
        FindOneFrontComponentQueryVariables
      >({
        query: FindOneFrontComponentDocument,
        variables: { id: frontComponentId },
        fetchPolicy: 'network-only',
      });

      const refetchedTokenPair =
        refetchResult.data?.frontComponent?.applicationTokenPair;

      if (!isDefined(refetchedTokenPair)) {
        throw new Error('Failed to regenerate application token pair');
      }

      setApplicationTokenPair(refetchedTokenPair);

      return refetchedTokenPair.applicationAccessToken.token;
    };

    if (!isDefined(applicationTokenPair)) {
      return await refetchApplicationAccessToken();
    }

    try {
      const result = await renewApplicationToken({
        variables: {
          applicationRefreshToken:
            applicationTokenPair.applicationRefreshToken.token,
        },
      });

      if (isDefined(result.errors) && result.errors.length > 0) {
        if (hasUnauthenticatedGraphqlError(result.errors)) {
          return await refetchApplicationAccessToken();
        }

        const errorMessage = result.errors
          .map((error) => error.message)
          .join(', ');

        throw new Error(`Token renewal failed: ${errorMessage}`);
      }

      const renewedTokenPair = result.data?.renewApplicationToken;

      if (!isDefined(renewedTokenPair)) {
        throw new Error('Failed to renew application token');
      }

      setApplicationTokenPair(renewedTokenPair);

      return renewedTokenPair.applicationAccessToken.token;
    } catch (error) {
      if (
        error instanceof ApolloError &&
        hasUnauthenticatedGraphqlError(error.graphQLErrors)
      ) {
        return await refetchApplicationAccessToken();
      }

      throw error;
    }
  }, [
    apolloClient,
    frontComponentId,
    renewApplicationToken,
    applicationTokenPair,
    setApplicationTokenPair,
  ]);

  return { requestAccessTokenRefresh };
};
