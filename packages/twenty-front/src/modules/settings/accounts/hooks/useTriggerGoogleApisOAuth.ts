import { useCallback } from 'react';

import { REACT_APP_SERVER_BASE_URL } from '~/config';
import { useGenerateTransientTokenMutation } from '~/generated/graphql';

export const useTriggerGoogleApisOAuth = () => {
  const [generateTransientToken] = useGenerateTransientTokenMutation();

  const triggerGoogleApisOAuth = useCallback(async () => {
    const authServerUrl = REACT_APP_SERVER_BASE_URL;

    const transientToken = await generateTransientToken();

    const token =
      transientToken.data?.generateTransientToken.transientToken.token;

    window.location.href = `${authServerUrl}/auth/google-gmail?transientToken=${token}`;
  }, [generateTransientToken]);

  return { triggerGoogleApisOAuth };
};
