import { ApolloError, useApolloClient } from '@apollo/client';
import { type GraphQLFormattedError } from 'graphql';
import { useRecoilCallback } from 'recoil';
import { isDefined } from 'twenty-shared/utils';

import { frontComponentApplicationTokenPairComponentState } from '@/front-components/states/frontComponentApplicationTokenPairComponentState';
import { useRecoilComponentCallbackState } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentCallbackState';
import { getSnapshotValue } from '@/ui/utilities/state/utils/getSnapshotValue';
import {
  FindOneFrontComponentDocument,
  type FindOneFrontComponentQuery,
  type FindOneFrontComponentQueryVariables,
  RenewApplicationTokenDocument,
  type RenewApplicationTokenMutation,
  type RenewApplicationTokenMutationVariables,
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

  const applicationTokenPairCallbackState = useRecoilComponentCallbackState(
    frontComponentApplicationTokenPairComponentState,
    frontComponentId,
  );

  const requestAccessTokenRefresh = useRecoilCallback(
    ({ set, snapshot }) =>
      async (): Promise<string> => {
        const refetchFrontComponentForNewTokenPair =
          async (): Promise<string> => {
            const result = await apolloClient.query<
              FindOneFrontComponentQuery,
              FindOneFrontComponentQueryVariables
            >({
              query: FindOneFrontComponentDocument,
              variables: { id: frontComponentId },
              fetchPolicy: 'network-only',
            });

            const newTokenPair =
              result.data?.frontComponent?.applicationTokenPair;

            if (!isDefined(newTokenPair)) {
              throw new Error('Failed to refetch application token pair');
            }

            set(applicationTokenPairCallbackState, newTokenPair);

            return newTokenPair.applicationAccessToken.token;
          };

        const applicationTokenPair = getSnapshotValue(
          snapshot,
          applicationTokenPairCallbackState,
        );

        if (!isDefined(applicationTokenPair)) {
          throw new Error(
            'Application token pair not defined, should not happen',
          );
        }

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

          if (isDefined(renewResult.errors) && renewResult.errors.length > 0) {
            if (hasUnauthenticatedGraphqlError(renewResult.errors)) {
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

          set(applicationTokenPairCallbackState, renewedTokenPair);

          return renewedTokenPair.applicationAccessToken.token;
        } catch (error) {
          if (
            error instanceof ApolloError &&
            // lets find a better way to write this -- in short if the refresh token is expired we should refetch the front component for a new token pair
            hasUnauthenticatedGraphqlError(error.graphQLErrors)
          ) {
            return await refetchFrontComponentForNewTokenPair();
          }

          throw error;
        }
      },
    [apolloClient, applicationTokenPairCallbackState, frontComponentId],
  );

  return { requestAccessTokenRefresh };
};
