import { REST_API_BASE_URL } from '@/apollo/constant/rest-api-base-url';
import { FrontComponentApplicationTokenPairEffect } from '@/front-components/components/FrontComponentApplicationTokenPairEffect';
import { useFrontComponentExecutionContext } from '@/front-components/hooks/useFrontComponentExecutionContext';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useTheme } from '@emotion/react';
import { t } from '@lingui/core/macro';
import { useCallback, useMemo, useState } from 'react';
import {
  type FrontComponentHostCommunicationApi,
  FrontComponentRenderer as SharedFrontComponentRenderer,
} from 'twenty-sdk/front-component-renderer';
import { isDefined } from 'twenty-shared/utils';
import { REACT_APP_SERVER_BASE_URL } from '~/config';
import {
  type ApplicationTokenPair,
  useFindOneFrontComponentQuery,
  useRenewApplicationTokenMutation,
} from '~/generated-metadata/graphql';

type FrontComponentRendererProps = {
  frontComponentId: string;
};

export const FrontComponentRenderer = ({
  frontComponentId,
}: FrontComponentRendererProps) => {
  const theme = useTheme();
  const { enqueueErrorSnackBar } = useSnackBar();
  const { executionContext, frontComponentHostCommunicationApi } =
    useFrontComponentExecutionContext();

  const componentUrl = `${REST_API_BASE_URL}/front-components/${frontComponentId}`;

  const handleError = useCallback(
    (error?: Error) => {
      if (!isDefined(error)) {
        return;
      }

      const errorMessage = error.message;

      enqueueErrorSnackBar({
        message: t`Failed to load front component: ${errorMessage}`,
      });
    },
    [enqueueErrorSnackBar],
  );

  const { data, loading } = useFindOneFrontComponentQuery({
    variables: { id: frontComponentId },
    onError: handleError,
  });

  const [renewApplicationToken] = useRenewApplicationTokenMutation();
  const [applicationTokenPair, setApplicationTokenPair] =
    useState<ApplicationTokenPair | null>(null);

  const queriedApplicationTokenPair =
    data?.frontComponent?.applicationTokenPair;

  const handleApplicationTokenPairChange = useCallback(
    (nextApplicationTokenPair: ApplicationTokenPair | null) => {
      if (!isDefined(nextApplicationTokenPair)) {
        setApplicationTokenPair(null);
        return;
      }

      setApplicationTokenPair((currentApplicationTokenPair) => {
        if (
          currentApplicationTokenPair?.applicationAccessToken.token ===
            nextApplicationTokenPair.applicationAccessToken.token &&
          currentApplicationTokenPair?.applicationRefreshToken.token ===
            nextApplicationTokenPair.applicationRefreshToken.token
        ) {
          return currentApplicationTokenPair;
        }

        return nextApplicationTokenPair;
      });
    },
    [],
  );

  const requestAccessTokenRefresh = useCallback(async (): Promise<string> => {
    if (!isDefined(applicationTokenPair)) {
      throw new Error('No refresh token available');
    }

    const result = await renewApplicationToken({
      variables: {
        applicationRefreshToken:
          applicationTokenPair.applicationRefreshToken.token,
      },
    });

    const renewedApplicationTokenPair = result.data?.renewApplicationToken;

    if (!isDefined(renewedApplicationTokenPair)) {
      throw new Error('Failed to renew application token');
    }

    setApplicationTokenPair(renewedApplicationTokenPair);

    return renewedApplicationTokenPair.applicationAccessToken.token;
  }, [applicationTokenPair, renewApplicationToken]);

  const composedFrontComponentHostCommunicationApi: FrontComponentHostCommunicationApi =
    useMemo(
      () => ({
        ...frontComponentHostCommunicationApi,
        requestAccessTokenRefresh,
      }),
      [frontComponentHostCommunicationApi, requestAccessTokenRefresh],
    );

  return (
    <>
      <FrontComponentApplicationTokenPairEffect
        frontComponentId={frontComponentId}
        queriedApplicationTokenPair={queriedApplicationTokenPair}
        onApplicationTokenPairChange={handleApplicationTokenPairChange}
      />
      {!loading &&
        isDefined(data?.frontComponent) &&
        isDefined(applicationTokenPair) && (
          <SharedFrontComponentRenderer
            theme={theme}
            componentUrl={componentUrl}
            applicationAccessToken={
              applicationTokenPair.applicationAccessToken.token
            }
            apiUrl={REACT_APP_SERVER_BASE_URL}
            executionContext={executionContext}
            frontComponentHostCommunicationApi={
              composedFrontComponentHostCommunicationApi
            }
            onError={handleError}
          />
        )}
    </>
  );
};
