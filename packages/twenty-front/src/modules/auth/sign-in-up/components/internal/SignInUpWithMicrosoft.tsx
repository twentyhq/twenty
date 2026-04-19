import { useHasMultipleAuthMethods } from '@/auth/sign-in-up/hooks/useHasMultipleAuthMethods';
import { useSignInWithMicrosoft } from '@/auth/sign-in-up/hooks/useSignInWithMicrosoft';
import { lastAuthenticatedMethodState } from '@/auth/states/lastAuthenticatedMethodState';
import {
  SignInUpStep,
  signInUpStepState,
} from '@/auth/states/signInUpStepState';
import { AuthenticatedMethod } from '@/auth/types/AuthenticatedMethod.enum';
import { type SocialSsoSignInUpActionType } from '@/auth/types/socialSsoSignInUp.type';
import { useLingui } from '@lingui/react/macro';
import { useContext } from 'react';
import { HorizontalSeparator, IconMicrosoft } from 'twenty-ui/display';
import { MainButton } from 'twenty-ui/input';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { LastUsedPill } from './LastUsedPill';
import { StyledSsoButtonContainer } from './SignInUpSsoButtonStyles';
import { ThemeContext } from 'twenty-ui/theme-constants';

export const SignInUpWithMicrosoft = ({
  action,
  isGlobalScope,
}: {
  action: SocialSsoSignInUpActionType;
  isGlobalScope?: boolean;
}) => {
  const { theme } = useContext(ThemeContext);
  const { t } = useLingui();

  const signInUpStep = useAtomStateValue(signInUpStepState);
  const [lastAuthenticatedMethod, setLastAuthenticatedMethod] = useAtomState(
    lastAuthenticatedMethodState,
  );
  const { signInWithMicrosoft } = useSignInWithMicrosoft();
  const hasMultipleAuthMethods = useHasMultipleAuthMethods();

  const handleClick = () => {
    setLastAuthenticatedMethod(AuthenticatedMethod.MICROSOFT);
    signInWithMicrosoft({ action });
  };

  const isLastUsed = lastAuthenticatedMethod === AuthenticatedMethod.MICROSOFT;

  return (
    <>
      <StyledSsoButtonContainer>
        <MainButton
          Icon={() => <IconMicrosoft size={theme.icon.size.md} />}
          title={t`Continue with Microsoft`}
          onClick={handleClick}
          variant={signInUpStep === SignInUpStep.Init ? undefined : 'secondary'}
          fullWidth
        />
        {isLastUsed && (isGlobalScope || hasMultipleAuthMethods) && (
          <LastUsedPill />
        )}
      </StyledSsoButtonContainer>
      <HorizontalSeparator visible={false} />
    </>
  );
};
