import { useLastAuthenticatedMethod } from '@/auth/sign-in-up/hooks/useLastAuthenticatedMethod';
import { useSignInWithMicrosoft } from '@/auth/sign-in-up/hooks/useSignInWithMicrosoft';
import {
    SignInUpStep,
    signInUpStepState,
} from '@/auth/states/signInUpStepState';
import { type SocialSSOSignInUpActionType } from '@/auth/types/socialSSOSignInUp.type';
import { useTheme } from '@emotion/react';
import { useLingui } from '@lingui/react/macro';
import { useRecoilValue } from 'recoil';
import { HorizontalSeparator, IconMicrosoft } from 'twenty-ui/display';
import { MainButton } from 'twenty-ui/input';
import {
    StyledLastUsedPill,
    StyledSSOButtonContainer,
} from './SignInUpSSOButtonStyles';

export const SignInUpWithMicrosoft = ({
  action,
}: {
  action: SocialSSOSignInUpActionType;
}) => {
  const theme = useTheme();
  const { t } = useLingui();

  const signInUpStep = useRecoilValue(signInUpStepState);
  const { lastAuthenticatedMethod, setLastAuthenticatedMethod } =
    useLastAuthenticatedMethod();
  const { signInWithMicrosoft } = useSignInWithMicrosoft();

  const handleClick = () => {
    setLastAuthenticatedMethod('microsoft');
    signInWithMicrosoft({ action });
  };

  const isLastUsed = lastAuthenticatedMethod === 'microsoft';

  return (
    <>
      <StyledSSOButtonContainer>
        <MainButton
          Icon={() => <IconMicrosoft size={theme.icon.size.md} />}
          title={t`Continue with Microsoft`}
          onClick={handleClick}
          variant={signInUpStep === SignInUpStep.Init ? undefined : 'secondary'}
          fullWidth
        />
        {isLastUsed && <StyledLastUsedPill label={t`Last`} />}
      </StyledSSOButtonContainer>
      <HorizontalSeparator visible={false} />
    </>
  );
};
