import { useRecoilValue, useSetRecoilState } from 'recoil';

import { useSignInUp } from '@/auth/sign-in-up/hooks/useSignInUp';
import { useSignInUpForm } from '@/auth/sign-in-up/hooks/useSignInUpForm';
import { SignInUpStep } from '@/auth/states/signInUpStepState';
import { useWorkspacePublicData } from '@/auth/sign-in-up/hooks/useWorkspacePublicData';
import { workspacePublicDataState } from '@/auth/states/workspacePublicDataState';
import {
  isTwentyHomePage,
  redirectToHome,
  twentyHomePage,
} from '~/utils/workspace-url.helper';
import { SignInUpWorkspaceSelection } from '@/auth/sign-in-up/components/SignInUpWorkspaceSelection';
import { SignInUpGlobalScope } from '@/auth/sign-in-up/components/SignInUpGlobalScope';
import { FooterNote } from '@/auth/sign-in-up/components/FooterNote';
import { AnimatedEaseIn } from 'twenty-ui';
import { Logo } from '@/auth/components/Logo';
import { Title } from '@/auth/components/Title';
import { SignInUpForm } from '@/auth/sign-in-up/components/SignInUpForm';
import { DEFAULT_WORKSPACE_NAME } from '@/ui/navigation/navigation-drawer/constants/DefaultWorkspaceName';
import { Link } from 'react-router-dom';
import { lastAuthenticateWorkspaceState } from '@/auth/states/lastAuthenticateWorkspaceState';

export const SignInUp = () => {
  const setLastAuthenticateWorkspaceState = useSetRecoilState(
    lastAuthenticateWorkspaceState,
  );
  const { form } = useSignInUpForm();
  const { signInUpStep } = useSignInUp(form);

  useWorkspacePublicData();

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
        <Link to={twentyHomePage} onClick={moveToHome}>
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
        isTwentyHomePage && signInUpStep === SignInUpStep.WorkspaceSelection ? (
          <SignInUpWorkspaceSelection />
        ) : (
          <SignInUpGlobalScope />
        )
      ) : (
        <SignInUpForm />
      )}
      <FooterNote />
    </>
  );
};
