import { useRecoilValue, useSetRecoilState } from 'recoil';

import { useSignInUp } from '@/auth/sign-in-up/hooks/useSignInUp';
import { useSignInUpForm } from '@/auth/sign-in-up/hooks/useSignInUpForm';
import { SignInUpStep } from '@/auth/states/signInUpStepState';
import { workspacePublicDataState } from '@/auth/states/workspacePublicDataState';
import {
  isTwentyHomePage,
  isTwentyWorkspaceSubdomain,
  redirectToHome,
  twentyHomePageUrl,
} from '~/utils/workspace-url.helper';
import { SignInUpGlobalScopeForm } from '@/auth/sign-in-up/components/SignInUpGlobalScopeForm';
import { FooterNote } from '@/auth/sign-in-up/components/FooterNote';
import { AnimatedEaseIn } from 'twenty-ui';
import { Logo } from '@/auth/components/Logo';
import { Title } from '@/auth/components/Title';
import { SignInUpWorkspaceScopeForm } from '@/auth/sign-in-up/components/SignInUpWorkspaceScopeForm';
import { DEFAULT_WORKSPACE_NAME } from '@/ui/navigation/navigation-drawer/constants/DefaultWorkspaceName';
import { Link } from 'react-router-dom';
import { lastAuthenticateWorkspaceState } from '@/auth/states/lastAuthenticateWorkspaceState';
import { SignInUpSSOIdentityProviderSelection } from '@/auth/sign-in-up/components/SignInUpSSOIdentityProviderSelection';

export const SignInUp = () => {
  const setLastAuthenticateWorkspaceState = useSetRecoilState(
    lastAuthenticateWorkspaceState,
  );

  const { form } = useSignInUpForm();
  const { signInUpStep } = useSignInUp(form);

  const workspacePublicData = useRecoilValue(workspacePublicDataState);

  const moveToHome = (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    setLastAuthenticateWorkspaceState(null);
    redirectToHome();
  };

  return (
    <>
      {/* TODO AMOREAUX: Need design for this */}
      {!isTwentyHomePage && (
        <Link to={twentyHomePageUrl} onClick={moveToHome}>
          Back to home
        </Link>
      )}
      <AnimatedEaseIn>
        <Logo workspaceLogo={workspacePublicData?.logo} />
      </AnimatedEaseIn>
      <Title animate>
        {`Welcome to ${workspacePublicData?.displayName ?? DEFAULT_WORKSPACE_NAME}`}
      </Title>
      {isTwentyHomePage ? (
        <SignInUpGlobalScopeForm />
      ) : isTwentyWorkspaceSubdomain &&
        signInUpStep === SignInUpStep.SSOIdentityProviderSelection ? (
        <SignInUpSSOIdentityProviderSelection />
      ) : isTwentyWorkspaceSubdomain ? (
        <SignInUpWorkspaceScopeForm />
      ) : null}
      <FooterNote />
    </>
  );
};
