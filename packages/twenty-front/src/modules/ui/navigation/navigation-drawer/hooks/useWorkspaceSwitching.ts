import { useRecoilValue, useSetRecoilState } from 'recoil';
import { AppPath } from '@/types/AppPath';

import { useAuth } from '@/auth/hooks/useAuth';
import { useSSO } from '@/auth/sign-in-up/hooks/useSSO';
import { availableSSOIdentityProvidersState } from '@/auth/states/availableWorkspacesForSSO';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { signInUpStepState } from '@/auth/states/signInUpStepState';
import { tokenPairState } from '@/auth/states/tokenPairState';
import { useSwitchWorkspaceMutation } from '~/generated/graphql';
import { isDefined } from '~/utils/isDefined';
import { buildWorkspaceUrl } from '~/utils/workspace-url.helper';

export const useWorkspaceSwitching = () => {
  const setTokenPair = useSetRecoilState(tokenPairState);

  const [switchWorkspaceMutation] = useSwitchWorkspaceMutation();
  const { redirectToSSOLoginPage } = useSSO();
  const currentWorkspace = useRecoilValue(currentWorkspaceState);
  const setAvailableWorkspacesForSSOState = useSetRecoilState(
    availableSSOIdentityProvidersState,
  );
  const setSignInUpStep = useSetRecoilState(signInUpStepState);
  const { signOut } = useAuth();

  const switchWorkspace = async (workspaceId: string) => {
    if (currentWorkspace?.id === workspaceId) return;

    const { data, errors } = await switchWorkspaceMutation({
      variables: {
        workspaceId,
      },
    });

    if (isDefined(errors) || !isDefined(data?.switchWorkspace.subdomain)) {
      return (window.location.href = AppPath.Index);
    }

    const url = buildWorkspaceUrl(data.switchWorkspace.subdomain);

    window.location.href = url;

    // window.location.href = `https://${data.switchWorkspace.subdomain}.twenty.work`;

    // const jwt = await generateJWT({
    //   variables: {
    //     workspaceId,
    //   },
    // });
    //
    // if (isDefined(jwt.errors)) {
    //   throw jwt.errors;
    // }
    //
    // if (!isDefined(jwt.data?.generateJWT)) {
    //   throw new Error('could not create token');
    // }
    //
    // if (
    //   jwt.data.generateJWT.reason === 'WORKSPACE_USE_SSO_AUTH' &&
    //   'availableSSOIDPs' in jwt.data.generateJWT
    // ) {
    //   if (jwt.data.generateJWT.availableSSOIDPs.length === 1) {
    //     redirectToSSOLoginPage(jwt.data.generateJWT.availableSSOIDPs[0].id);
    //   }
    //
    //   if (jwt.data.generateJWT.availableSSOIDPs.length > 1) {
    //     await signOut();
    //     setAvailableWorkspacesForSSOState(
    //       jwt.data.generateJWT.availableSSOIDPs,
    //     );
    //     setSignInUpStep(SignInUpStep.SSOWorkspaceSelection);
    //   }
    //
    //   return;
    // }
    //
    // if (
    //   jwt.data.generateJWT.reason !== 'WORKSPACE_USE_SSO_AUTH' &&
    //   'authTokens' in jwt.data.generateJWT
    // ) {
    //   const { tokens } = jwt.data.generateJWT.authTokens;
    //   setTokenPair(tokens);
    //   await sleep(0); // This hacky workaround is necessary to ensure the tokens stored in the cookie are updated correctly.
    //   window.location.href = AppPath.Index;
    // }
  };

  return { switchWorkspace };
};
