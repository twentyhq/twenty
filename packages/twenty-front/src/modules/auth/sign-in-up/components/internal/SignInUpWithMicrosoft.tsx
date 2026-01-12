import { useSignInWithMicrosoft } from '@/auth/sign-in-up/hooks/useSignInWithMicrosoft';
import {
  lastAuthenticatedMethodState,
  LAST_AUTHENTICATED_METHOD_STORAGE_KEY,
  type LastAuthenticatedMethod,
} from '@/auth/states/lastAuthenticatedMethodState';
import {
  SignInUpStep,
  signInUpStepState,
} from '@/auth/states/signInUpStepState';
import { type SocialSSOSignInUpActionType } from '@/auth/types/socialSSOSignInUp.type';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { useLingui } from '@lingui/react/macro';
import { useRecoilValue } from 'recoil';
import { Pill } from 'twenty-ui/components';
import { HorizontalSeparator, IconMicrosoft } from 'twenty-ui/display';
import { MainButton } from 'twenty-ui/input';

const StyledButtonContainer = styled.div`
  position: relative;
  width: 100%;
`;

const StyledLastUsedPill = styled(Pill)`
  position: absolute;
  right: -${({ theme }) => theme.spacing(2)};
  top: -${({ theme }) => theme.spacing(2)};
  background: ${({ theme }) => theme.color.blue};
  color: ${({ theme }) => theme.font.color.inverted};
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
  const { signInWithMicrosoft } = useSignInWithMicrosoft();

  const handleClick = () => {
    // Save to localStorage synchronously before redirect to ensure it persists
    localStorage.setItem(
      LAST_AUTHENTICATED_METHOD_STORAGE_KEY,
      JSON.stringify('microsoft' as LastAuthenticatedMethod),
    );
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
