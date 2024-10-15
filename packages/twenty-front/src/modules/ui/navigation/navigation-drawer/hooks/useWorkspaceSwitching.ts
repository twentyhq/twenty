import { useRecoilValue, useSetRecoilState } from 'recoil';

import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { tokenPairState } from '@/auth/states/tokenPairState';
import { AppPath } from '@/types/AppPath';
import { useGenerateJwtMutation } from '~/generated/graphql';
import { isDefined } from '~/utils/isDefined';
import { sleep } from '~/utils/sleep';
import { useSSO } from '@/auth/sign-in-up/hooks/useSSO';

export const useWorkspaceSwitching = () => {
  const setTokenPair = useSetRecoilState(tokenPairState);
  const [generateJWT] = useGenerateJwtMutation();
  const { redirectToSSOLoginPage } = useSSO();
  const currentWorkspace = useRecoilValue(currentWorkspaceState);

  const switchWorkspace = async (workspaceId: string) => {
    if (currentWorkspace?.id === workspaceId) return;
    const jwt = await generateJWT({
      variables: {
        workspaceId,
      },
    });

    if (isDefined(jwt.errors)) {
      throw jwt.errors;
    }

    if (!isDefined(jwt.data?.generateJWT)) {
      throw new Error('could not create token');
    }

    if (
      jwt.data.generateJWT.reason === 'WORKSPACE_USE_SSO_AUTH' &&
      'availableSSOIDPs' in jwt.data.generateJWT
    ) {
      if (jwt.data.generateJWT.availableSSOIDPs.length === 1) {
        redirectToSSOLoginPage(jwt.data.generateJWT.availableSSOIDPs[0].id);
      }

      if (jwt.data.generateJWT.availableSSOIDPs.length > 1) {
        // TODO: redirect to idp selection page
      }

      return;
    }

    if (
      jwt.data.generateJWT.reason !== 'WORKSPACE_USE_SSO_AUTH' &&
      'authTokens' in jwt.data.generateJWT
    ) {
      const { tokens } = jwt.data.generateJWT.authTokens;
      setTokenPair(tokens);
      await sleep(0); // This hacky workaround is necessary to ensure the tokens stored in the cookie are updated correctly.
      window.location.href = AppPath.Index;
    }
  };

  return { switchWorkspace };
};
