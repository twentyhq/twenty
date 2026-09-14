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
import { IconMicrosoft } from 'twenty-ui/icon';
import { HorizontalSeparator } from 'twenty-ui/layout';
import { Button } from 'twenty-ui/input';
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
        <Button
          startIcon={<IconMicrosoft size={theme.icon.size.md} />}
          onClick={handleClick}
          fullWidth
          elevated
          variant={signInUpStep === SignInUpStep.Init ? 'solid' : 'outline'}
          style={{
            fontWeight: 'var(--t-font-weight-semi-bold)',
            paddingInline: 'var(--t-spacing-3)',
          }}
        >{t`Continue with Microsoft`}</Button>
        {isLastUsed && (isGlobalScope || hasMultipleAuthMethods) && (
          <LastUsedPill />
        )}
      </StyledSsoButtonContainer>
      <HorizontalSeparator visible={false} />
    </>
  );
};
