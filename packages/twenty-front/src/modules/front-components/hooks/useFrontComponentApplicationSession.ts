import { CombinedGraphQLErrors } from '@apollo/client/errors';
import { useApolloClient } from '@apollo/client/react';
import { type GraphQLFormattedError } from 'graphql';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { frontComponentApplicationSessionFamilyState } from '@/front-components/states/frontComponentApplicationSessionFamilyState';
import { pendingFrontComponentApplicationSessionPromiseFamilyState } from '@/front-components/states/pendingFrontComponentApplicationSessionPromiseFamilyState';
import { type FrontComponentApplicationSession } from '@/front-components/types/FrontComponentApplicationSession';
import {
  GenerateFrontComponentApplicationSessionDocument,
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
  applicationSession: FrontComponentApplicationSession,
): boolean =>
  new Date(
    applicationSession.applicationTokenPair.applicationAccessToken.expiresAt,
  ).getTime() -
    Date.now() >
  MINIMUM_ACCESS_TOKEN_REMAINING_VALIDITY_MS;

const wasTokenPairRecentlyObtained = (
  applicationSession: FrontComponentApplicationSession,
): boolean =>
  Date.now() - applicationSession.tokenPairObtainedAt <
  RECENT_TOKEN_PAIR_RENEWAL_WINDOW_MS;

export const useFrontComponentApplicationSession = () => {
  const apolloClient = useApolloClient();
  const store = useStore();

  const generateApplicationSession = useCallback(
    async (
      applicationId: string,
    ): Promise<FrontComponentApplicationSession> => {
      const result = await apolloClient.mutate({
        mutation: GenerateFrontComponentApplicationSessionDocument,
        variables: { applicationId },
      });

      const generatedApplicationSession =
        result.data?.generateFrontComponentApplicationSession;

      if (!isDefined(generatedApplicationSession)) {
        throw new Error(
          'Failed to generate front component application session',
        );
      }

      return {
        applicationTokenPair: generatedApplicationSession.applicationTokenPair,
        applicationVariables: generatedApplicationSession.applicationVariables,
        tokenPairObtainedAt: Date.now(),
      };
    },
    [apolloClient],
  );

  const renewApplicationSession = useCallback(
    async ({
      applicationId,
      applicationSession,
    }: {
      applicationId: string;
      applicationSession: FrontComponentApplicationSession;
    }): Promise<FrontComponentApplicationSession> => {
      try {
        const result = await apolloClient.mutate({
          mutation: RenewApplicationTokenDocument,
          variables: {
            applicationRefreshToken:
              applicationSession.applicationTokenPair.applicationRefreshToken
                .token,
          },
        });

        const renewedTokenPair = result.data?.renewApplicationToken;

        if (!isDefined(renewedTokenPair)) {
          throw new Error('Failed to renew application token');
        }

        return {
          ...applicationSession,
          applicationTokenPair: renewedTokenPair,
          tokenPairObtainedAt: Date.now(),
        };
      } catch (error) {
        if (
          CombinedGraphQLErrors.is(error) &&
          hasApplicationRefreshTokenInvalidOrExpiredSubCode(error.errors)
        ) {
          return await generateApplicationSession(applicationId);
        }

        throw error;
      }
    },
    [apolloClient, generateApplicationSession],
  );

  const renewOrGenerateApplicationSessionOncePerApplication = useCallback(
    (applicationId: string): Promise<FrontComponentApplicationSession> => {
      const pendingApplicationSessionPromiseAtom =
        pendingFrontComponentApplicationSessionPromiseFamilyState.atomFamily(
          applicationId,
        );

      const pendingApplicationSessionPromise = store.get(
        pendingApplicationSessionPromiseAtom,
      );

      if (isDefined(pendingApplicationSessionPromise)) {
        return pendingApplicationSessionPromise;
      }

      const applicationSessionAtom =
        frontComponentApplicationSessionFamilyState.atomFamily(applicationId);

      const currentApplicationSession = store.get(applicationSessionAtom);

      const applicationSessionPromise = (
        isDefined(currentApplicationSession)
          ? renewApplicationSession({
              applicationId,
              applicationSession: currentApplicationSession,
            })
          : generateApplicationSession(applicationId)
      )
        .then((applicationSession) => {
          store.set(applicationSessionAtom, applicationSession);

          return applicationSession;
        })
        .finally(() => {
          store.set(pendingApplicationSessionPromiseAtom, null);
        });

      store.set(
        pendingApplicationSessionPromiseAtom,
        applicationSessionPromise,
      );

      return applicationSessionPromise;
    },
    [generateApplicationSession, renewApplicationSession, store],
  );

  const loadFrontComponentApplicationSession = useCallback(
    async (
      applicationId: string,
    ): Promise<FrontComponentApplicationSession> => {
      const applicationSession = store.get(
        frontComponentApplicationSessionFamilyState.atomFamily(applicationId),
      );

      if (
        isDefined(applicationSession) &&
        hasEnoughAccessTokenValidityLeft(applicationSession)
      ) {
        return applicationSession;
      }

      return await renewOrGenerateApplicationSessionOncePerApplication(
        applicationId,
      );
    },
    [renewOrGenerateApplicationSessionOncePerApplication, store],
  );

  const requestApplicationAccessTokenRefresh = useCallback(
    async (applicationId: string): Promise<string> => {
      const applicationSession = store.get(
        frontComponentApplicationSessionFamilyState.atomFamily(applicationId),
      );

      if (
        isDefined(applicationSession) &&
        wasTokenPairRecentlyObtained(applicationSession)
      ) {
        return applicationSession.applicationTokenPair.applicationAccessToken
          .token;
      }

      const refreshedApplicationSession =
        await renewOrGenerateApplicationSessionOncePerApplication(
          applicationId,
        );

      return refreshedApplicationSession.applicationTokenPair
        .applicationAccessToken.token;
    },
    [renewOrGenerateApplicationSessionOncePerApplication, store],
  );

  return {
    loadFrontComponentApplicationSession,
    requestApplicationAccessTokenRefresh,
  };
};
