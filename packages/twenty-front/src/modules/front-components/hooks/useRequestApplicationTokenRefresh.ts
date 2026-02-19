import { useApolloClient } from '@apollo/client';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';
import {
  FindOneFrontComponentDocument,
  type FindOneFrontComponentQuery,
  type FindOneFrontComponentQueryVariables,
  useRenewApplicationTokenMutation,
} from '~/generated-metadata/graphql';

const hasUnauthenticatedGraphqlError = (
  errors:
    | ReadonlyArray<{
        message?: string;
        extensions?: { code?: string };
      }>
    | undefined,
): boolean => {
  if (!isDefined(errors)) {
    return false;
  }

  return errors.some(
    (error) =>
      error.extensions?.code === 'UNAUTHENTICATED' ||
      error.message === 'Unauthorized',
  );
};

type UseRequestApplicationTokenRefreshArgs = {
  frontComponentId: string;
};

export const useRequestApplicationTokenRefresh = ({
  frontComponentId,
}: UseRequestApplicationTokenRefreshArgs) => {
  const apolloClient = useApolloClient();
  const [renewApplicationToken] = useRenewApplicationTokenMutation();

  const requestAccessTokenRefresh = useCallback(async (): Promise<string> => {
    const cachedData = apolloClient.cache.readQuery<FindOneFrontComponentQuery>(
      {
        query: FindOneFrontComponentDocument,
        variables: { id: frontComponentId },
      },
    );

    const applicationTokenPair =
      cachedData?.frontComponent?.applicationTokenPair;

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
              applicationTokenPair: renewedTokenPair,
            },
          };
        },
      );

      return renewedTokenPair.applicationAccessToken.token;
    } catch (error) {
      const graphQLErrors = (
        error as {
          graphQLErrors?: ReadonlyArray<{
            message?: string;
            extensions?: { code?: string };
          }>;
        }
      ).graphQLErrors;

      if (hasUnauthenticatedGraphqlError(graphQLErrors)) {
        return await refetchApplicationAccessToken();
      }

      throw error;
    }
  }, [apolloClient, frontComponentId, renewApplicationToken]);

  return { requestAccessTokenRefresh };
};
