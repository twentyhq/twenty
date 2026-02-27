import { ApolloError, useApolloClient } from '@apollo/client';
import { type GraphQLFormattedError } from 'graphql';
import { useCallback } from 'react';
import { useStore } from 'jotai';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

import { frontComponentApplicationTokenPairComponentState } from '@/front-components/states/frontComponentApplicationTokenPairComponentState';
import { useAtomComponentStateCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateCallbackState';
import {
  FindOneFrontComponentDocument,
  type FindOneFrontComponentQuery,
  type FindOneFrontComponentQueryVariables,
  RenewApplicationTokenDocument,
  type RenewApplicationTokenMutation,
  type RenewApplicationTokenMutationVariables,
} from '~/generated-metadata/graphql';

const APPLICATION_REFRESH_TOKEN_INVALID_OR_EXPIRED_SUB_CODE =
  'APPLICATION_REFRESH_TOKEN_INVALID_OR_EXPIRED';

const hasApplicationRefreshTokenInvalidOrExpiredSubCode = (
  errors: ReadonlyArray<GraphQLFormattedError>,
): boolean =>
  errors.some(
    (error) =>
      error.extensions?.subCode ===
      APPLICATION_REFRESH_TOKEN_INVALID_OR_EXPIRED_SUB_CODE,
  );

type UseRequestApplicationTokenRefreshArgs = {
  frontComponentId: string;
};

export const useRequestApplicationTokenRefresh = ({
  frontComponentId,
}: UseRequestApplicationTokenRefreshArgs) => {
  const apolloClient = useApolloClient();
  const store = useStore();

  const applicationTokenPairAtom = useAtomComponentStateCallbackState(
    frontComponentApplicationTokenPairComponentState,
    frontComponentId,
  );

  const requestAccessTokenRefresh = useCallback(async (): Promise<string> => {
    const refetchFrontComponentForNewTokenPair = async (): Promise<string> => {
      const result = await apolloClient.query<
        FindOneFrontComponentQuery,
        FindOneFrontComponentQueryVariables
      >({
        query: FindOneFrontComponentDocument,
        variables: { id: frontComponentId },
        fetchPolicy: 'network-only',
      });

      const newTokenPair = result.data?.frontComponent?.applicationTokenPair;

      if (!isDefined(newTokenPair)) {
        throw new Error('Failed to refetch application token pair');
      }

      store.set(applicationTokenPairAtom, newTokenPair);

      return newTokenPair.applicationAccessToken.token;
    };

    const applicationTokenPair = store.get(applicationTokenPairAtom);

    if (!isDefined(applicationTokenPair)) {
      throw new Error(
        'Application token pair must be initialized before requesting a refresh. Ensure the front component has loaded its token pair before invoking refresh.',
      );
    }

    // First try renewing via the refresh token (fast path).
    // If the refresh token itself is expired, fall back to refetching
    // the front component which issues a fresh token pair server-side.
    try {
      const renewResult = await apolloClient.mutate<
        RenewApplicationTokenMutation,
        RenewApplicationTokenMutationVariables
      >({
        mutation: RenewApplicationTokenDocument,
        variables: {
          applicationRefreshToken:
            applicationTokenPair.applicationRefreshToken.token,
        },
      });

      if (isNonEmptyArray(renewResult.errors)) {
        if (
          hasApplicationRefreshTokenInvalidOrExpiredSubCode(renewResult.errors)
        ) {
          return await refetchFrontComponentForNewTokenPair();
        }

        const errorMessage = renewResult.errors
          .map((error) => error.message)
          .join(', ');

        throw new Error(`Token renewal failed: ${errorMessage}`);
      }

      const renewedTokenPair = renewResult.data?.renewApplicationToken;

      if (!isDefined(renewedTokenPair)) {
        throw new Error('Failed to renew application token');
      }

      store.set(applicationTokenPairAtom, renewedTokenPair);

      return renewedTokenPair.applicationAccessToken.token;
    } catch (error) {
      if (
        error instanceof ApolloError &&
        hasApplicationRefreshTokenInvalidOrExpiredSubCode(error.graphQLErrors)
      ) {
        return await refetchFrontComponentForNewTokenPair();
      }

      throw error;
    }
  }, [apolloClient, applicationTokenPairAtom, frontComponentId, store]);

  return { requestAccessTokenRefresh };
};
