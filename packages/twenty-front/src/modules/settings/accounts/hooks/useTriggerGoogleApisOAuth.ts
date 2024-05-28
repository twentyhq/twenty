import { useCallback } from 'react';

import { AppPath } from '@/types/AppPath';
import { REACT_APP_SERVER_BASE_URL } from '~/config';
import { useGenerateTransientTokenMutation } from '~/generated/graphql';

export const useTriggerGoogleApisOAuth = () => {
  const [generateTransientToken] = useGenerateTransientTokenMutation();

  const triggerGoogleApisOAuth = useCallback(
    async (redirectLocation?: AppPath) => {
      const authServerUrl = REACT_APP_SERVER_BASE_URL;

      const transientToken = await generateTransientToken();

      const token =
        transientToken.data?.generateTransientToken.transientToken.token;

      let params = `transientToken=${token}`;

      params += redirectLocation
        ? `&redirectLocation=${encodeURIComponent(redirectLocation)}`
        : '';

      window.location.href = `${authServerUrl}/auth/google-apis?${params}`;
    },
    [generateTransientToken],
  );

  return { triggerGoogleApisOAuth };
};
