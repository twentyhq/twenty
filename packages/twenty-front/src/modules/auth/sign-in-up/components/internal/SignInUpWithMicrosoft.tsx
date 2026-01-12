import { useSignInWithMicrosoft } from '@/auth/sign-in-up/hooks/useSignInWithMicrosoft';
import { lastAuthenticatedMethodState } from '@/auth/states/lastAuthenticatedMethodState';
import {
    SignInUpStep,
    signInUpStepState,
} from '@/auth/states/signInUpStepState';
import { type SocialSSOSignInUpActionType } from '@/auth/types/socialSSOSignInUp.type';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { Pill } from 'twenty-ui/components';
import { HorizontalSeparator, IconMicrosoft } from 'twenty-ui/display';
import { MainButton } from 'twenty-ui/input';

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

export const SignInUpWithMicrosoft = ({
  action,
}: {
  action: SocialSSOSignInUpActionType;
}) => {
  const theme = useTheme();
  const { t } = useLingui();

  const signInUpStep = useRecoilValue(signInUpStepState);
  const lastAuthenticatedMethod = useRecoilValue(lastAuthenticatedMethodState);
  const setLastAuthenticatedMethod = useSetRecoilState(
    lastAuthenticatedMethodState,
  );
  const { signInWithMicrosoft } = useSignInWithMicrosoft();

  const handleClick = () => {
    setLastAuthenticatedMethod('microsoft');
    signInWithMicrosoft({ action });
  };

  const isLastUsed = lastAuthenticatedMethod === 'microsoft';

  return (
    <>
      <StyledButtonContainer>
        <MainButton
          Icon={() => <IconMicrosoft size={theme.icon.size.md} />}
          title={t`Continue with Microsoft`}
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
