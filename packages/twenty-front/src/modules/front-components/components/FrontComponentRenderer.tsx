import { REST_API_BASE_URL } from '@/apollo/constant/rest-api-base-url';
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

  // Refreshed token override, tagged with the component it belongs to
  const [refreshedTokenOverride, setRefreshedTokenOverride] = useState<{
    frontComponentId: string;
    applicationTokenPair: ApplicationTokenPair;
  } | null>(null);

  const queriedApplicationTokenPair =
    data?.frontComponent?.applicationTokenPair;

  // Derive current token: refreshed override for this component > queried > null
  // When frontComponentId changes, override doesn't match → falls through to
  // query token (identity-safe via Apollo variables) → no stale-token window.
  const applicationTokenPair =
    refreshedTokenOverride?.frontComponentId === frontComponentId
      ? refreshedTokenOverride.applicationTokenPair
      : (queriedApplicationTokenPair ?? null);

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

    setRefreshedTokenOverride({
      frontComponentId,
      applicationTokenPair: renewedApplicationTokenPair,
    });

    return renewedApplicationTokenPair.applicationAccessToken.token;
  }, [applicationTokenPair, frontComponentId, renewApplicationToken]);

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
