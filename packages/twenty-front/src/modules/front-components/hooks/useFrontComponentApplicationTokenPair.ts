import { CombinedGraphQLErrors } from '@apollo/client/errors';
import { useApolloClient } from '@apollo/client/react';
import { type GraphQLFormattedError } from 'graphql';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { frontComponentApplicationTokenPairFamilyState } from '@/front-components/states/frontComponentApplicationTokenPairFamilyState';
import { pendingFrontComponentApplicationTokenPairPromiseFamilyState } from '@/front-components/states/pendingFrontComponentApplicationTokenPairPromiseFamilyState';
import { type FrontComponentApplicationTokenPair } from '@/front-components/types/FrontComponentApplicationTokenPair';
import {
  GenerateFrontComponentApplicationTokenPairDocument,
  RenewApplicationTokenDocument,
} from '~/generated-metadata/graphql';
import { isGraphqlErrorOfType } from '~/utils/is-graphql-error-of-type.util';

const APPLICATION_REFRESH_TOKEN_INVALID_OR_EXPIRED_SUB_CODE =
  'APPLICATION_REFRESH_TOKEN_INVALID_OR_EXPIRED';

// The access token handed out on mount is used right away to fetch the
// component source, which has no refresh path; the margin also absorbs
// browser clock skew.
const MINIMUM_ACCESS_TOKEN_REMAINING_VALIDITY_MS = 5 * 60 * 1000;

// Workers of an application hit 401 around the same time; those arriving
// just after a renewal reuse it instead of renewing again.
const RECENT_TOKEN_PAIR_RENEWAL_WINDOW_MS = 30 * 1000;

const hasApplicationRefreshTokenInvalidOrExpiredSubCode = (
  errors: ReadonlyArray<GraphQLFormattedError>,
): boolean =>
  errors.some((error) =>
    isGraphqlErrorOfType(
      error,
      APPLICATION_REFRESH_TOKEN_INVALID_OR_EXPIRED_SUB_CODE,
    ),
  );

const hasEnoughAccessTokenValidityLeft = (
  applicationTokenPair: FrontComponentApplicationTokenPair,
): boolean =>
  new Date(applicationTokenPair.applicationAccessToken.expiresAt).getTime() -
    Date.now() >
  MINIMUM_ACCESS_TOKEN_REMAINING_VALIDITY_MS;

const wasRecentlyObtained = (
  applicationTokenPair: FrontComponentApplicationTokenPair,
): boolean =>
  Date.now() - applicationTokenPair.obtainedAt <
  RECENT_TOKEN_PAIR_RENEWAL_WINDOW_MS;

export const useFrontComponentApplicationTokenPair = () => {
  const apolloClient = useApolloClient();
  const store = useStore();

  const generateApplicationTokenPair = useCallback(
    async (
      applicationId: string,
    ): Promise<FrontComponentApplicationTokenPair> => {
      const result = await apolloClient.mutate({
        mutation: GenerateFrontComponentApplicationTokenPairDocument,
        variables: { applicationId },
      });

      const generatedApplicationTokenPair =
        result.data?.generateFrontComponentApplicationTokenPair;

      if (!isDefined(generatedApplicationTokenPair)) {
        throw new Error(
          'Failed to generate front component application token pair',
        );
      }

      return { ...generatedApplicationTokenPair, obtainedAt: Date.now() };
    },
    [apolloClient],
  );

  const renewApplicationTokenPair = useCallback(
    async ({
      applicationId,
      applicationTokenPair,
    }: {
      applicationId: string;
      applicationTokenPair: FrontComponentApplicationTokenPair;
    }): Promise<FrontComponentApplicationTokenPair> => {
      try {
        const result = await apolloClient.mutate({
          mutation: RenewApplicationTokenDocument,
          variables: {
            applicationRefreshToken:
              applicationTokenPair.applicationRefreshToken.token,
          },
        });

        const renewedApplicationTokenPair = result.data?.renewApplicationToken;

        if (!isDefined(renewedApplicationTokenPair)) {
          throw new Error('Failed to renew application token');
        }

        return { ...renewedApplicationTokenPair, obtainedAt: Date.now() };
      } catch (error) {
        if (
          CombinedGraphQLErrors.is(error) &&
          hasApplicationRefreshTokenInvalidOrExpiredSubCode(error.errors)
        ) {
          return await generateApplicationTokenPair(applicationId);
        }

        throw error;
      }
    },
    [apolloClient, generateApplicationTokenPair],
  );

  const renewOrGenerateApplicationTokenPairOncePerApplication = useCallback(
    (applicationId: string): Promise<FrontComponentApplicationTokenPair> => {
      const pendingApplicationTokenPairPromiseAtom =
        pendingFrontComponentApplicationTokenPairPromiseFamilyState.atomFamily(
          applicationId,
        );

      const pendingApplicationTokenPairPromise = store.get(
        pendingApplicationTokenPairPromiseAtom,
      );

      if (isDefined(pendingApplicationTokenPairPromise)) {
        return pendingApplicationTokenPairPromise;
      }

      const applicationTokenPairAtom =
        frontComponentApplicationTokenPairFamilyState.atomFamily(applicationId);

      const currentApplicationTokenPair = store.get(applicationTokenPairAtom);

      const applicationTokenPairPromise = (
        isDefined(currentApplicationTokenPair)
          ? renewApplicationTokenPair({
              applicationId,
              applicationTokenPair: currentApplicationTokenPair,
            })
          : generateApplicationTokenPair(applicationId)
      )
        .then((applicationTokenPair) => {
          store.set(applicationTokenPairAtom, applicationTokenPair);

          return applicationTokenPair;
        })
        .finally(() => {
          store.set(pendingApplicationTokenPairPromiseAtom, null);
        });

      store.set(
        pendingApplicationTokenPairPromiseAtom,
        applicationTokenPairPromise,
      );

      return applicationTokenPairPromise;
    },
    [generateApplicationTokenPair, renewApplicationTokenPair, store],
  );

  const loadFrontComponentApplicationTokenPair = useCallback(
    async (
      applicationId: string,
    ): Promise<FrontComponentApplicationTokenPair> => {
      const applicationTokenPair = store.get(
        frontComponentApplicationTokenPairFamilyState.atomFamily(applicationId),
      );

      if (
        isDefined(applicationTokenPair) &&
        hasEnoughAccessTokenValidityLeft(applicationTokenPair)
      ) {
        return applicationTokenPair;
      }

      return await renewOrGenerateApplicationTokenPairOncePerApplication(
        applicationId,
      );
    },
    [renewOrGenerateApplicationTokenPairOncePerApplication, store],
  );

  const requestApplicationAccessTokenRefresh = useCallback(
    async (applicationId: string): Promise<string> => {
      const applicationTokenPair = store.get(
        frontComponentApplicationTokenPairFamilyState.atomFamily(applicationId),
      );

      if (
        isDefined(applicationTokenPair) &&
        wasRecentlyObtained(applicationTokenPair)
      ) {
        return applicationTokenPair.applicationAccessToken.token;
      }

      const refreshedApplicationTokenPair =
        await renewOrGenerateApplicationTokenPairOncePerApplication(
          applicationId,
        );

      return refreshedApplicationTokenPair.applicationAccessToken.token;
    },
    [renewOrGenerateApplicationTokenPairOncePerApplication, store],
  );

  return {
    loadFrontComponentApplicationTokenPair,
    requestApplicationAccessTokenRefresh,
  };
};
