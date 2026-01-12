import { useSignInWithGoogle } from '@/auth/sign-in-up/hooks/useSignInWithGoogle';
import { lastAuthenticatedMethodState } from '@/auth/states/lastAuthenticatedMethodState';
import {
  SignInUpStep,
  signInUpStepState,
} from '@/auth/states/signInUpStepState';
import { type SocialSSOSignInUpActionType } from '@/auth/types/socialSSOSignInUp.type';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import { memo } from 'react';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { Pill } from 'twenty-ui/components';
import { HorizontalSeparator, IconGoogle } from 'twenty-ui/display';
import { MainButton } from 'twenty-ui/input';

const GoogleIcon = memo(() => {
  const theme = useTheme();
  return <IconGoogle size={theme.icon.size.md} />;
});

const StyledButtonContainer = styled.div`
  position: relative;
  width: 100%;
`;

const StyledLastUsedPill = styled(Pill)`
  position: absolute;
  right: ${({ theme }) => theme.spacing(2)};
  top: 50%;
  transform: translateY(-50%);
`;

export const SignInUpWithGoogle = ({
  action,
}: {
  action: SocialSSOSignInUpActionType;
}) => {
  const { t } = useLingui();
  const signInUpStep = useRecoilValue(signInUpStepState);
  const lastAuthenticatedMethod = useRecoilValue(lastAuthenticatedMethodState);
  const setLastAuthenticatedMethod = useSetRecoilState(
    lastAuthenticatedMethodState,
  );
  const { signInWithGoogle } = useSignInWithGoogle();

  const handleClick = () => {
    setLastAuthenticatedMethod('google');
    signInWithGoogle({ action });
  };

  const isLastUsed = lastAuthenticatedMethod === 'google';

  return (
    <>
      <StyledButtonContainer>
        <MainButton
          Icon={GoogleIcon}
          title={t`Continue with Google`}
          onClick={handleClick}
          variant={signInUpStep === SignInUpStep.Init ? undefined : 'secondary'}
          fullWidth
        />
        {isLastUsed && <StyledLastUsedPill label={t`Last`} />}
      </StyledButtonContainer>
      <HorizontalSeparator visible={false} />
    </>
  );
};
