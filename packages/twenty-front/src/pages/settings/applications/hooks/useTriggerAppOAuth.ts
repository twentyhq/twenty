import { useMutation } from '@apollo/client/react';
import { useCallback } from 'react';

import { useRedirect } from '@/domain-manager/hooks/useRedirect';
import { REACT_APP_SERVER_BASE_URL } from '~/config';
import { GenerateTransientTokenDocument } from '~/generated-metadata/graphql';

// Mints a transient token then redirects to the generic app OAuth endpoint.
// Mirrors `useTriggerApisOAuth` for Google/Microsoft, but the URL template is
// /apps/oauth/authorize and works for any app-declared OAuth provider.
export const useTriggerAppOAuth = () => {
  const [generateTransientToken] = useMutation(GenerateTransientTokenDocument);
  const { redirect } = useRedirect();

  const triggerAppOAuth = useCallback(
    async ({
      applicationId,
      providerName,
      redirectLocation,
    }: {
      applicationId: string;
      providerName: string;
      redirectLocation?: string;
    }) => {
      const transient = await generateTransientToken();
      const token =
        transient.data?.generateTransientToken.transientToken.token;

      if (!token) {
        return;
      }

      const params = new URLSearchParams({
        applicationId,
        providerName,
        transientToken: token,
      });

      if (redirectLocation) {
        params.set('redirectLocation', redirectLocation);
      }

      redirect(
        `${REACT_APP_SERVER_BASE_URL}/apps/oauth/authorize?${params.toString()}`,
      );
    },
    [generateTransientToken, redirect],
  );

  return { triggerAppOAuth };
};
