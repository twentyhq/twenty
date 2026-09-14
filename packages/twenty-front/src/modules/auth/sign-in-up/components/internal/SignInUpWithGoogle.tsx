import { BUTTON_ACTION_CLASS_NAME } from '@/ui/input/styles/ButtonActionClassName';

import { isDefined } from 'twenty-shared/utils';
import { useHasMultipleAuthMethods } from '@/auth/sign-in-up/hooks/useHasMultipleAuthMethods';
import { useSignInWithGoogle } from '@/auth/sign-in-up/hooks/useSignInWithGoogle';
import { lastAuthenticatedMethodState } from '@/auth/states/lastAuthenticatedMethodState';
import {
  SignInUpStep,
  signInUpStepState,
} from '@/auth/states/signInUpStepState';
import { AuthenticatedMethod } from '@/auth/types/AuthenticatedMethod.enum';
import { type SocialSsoSignInUpActionType } from '@/auth/types/socialSsoSignInUp.type';
import { useLingui } from '@lingui/react/macro';
import { memo, useContext } from 'react';
import { IconGoogle } from 'twenty-ui/icon';
import { HorizontalSeparator } from 'twenty-ui/layout';
import { Button } from 'twenty-ui/input';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { LastUsedPill } from './LastUsedPill';
import { StyledSsoButtonContainer } from './SignInUpSsoButtonStyles';
import { ThemeContext } from 'twenty-ui/theme-constants';

const GoogleIcon = memo(() => {
  const { theme } = useContext(ThemeContext);
  return <IconGoogle size={theme.icon.size.md} />;
});

export const SignInUpWithGoogle = ({
  action,
  isGlobalScope,
}: {
  action: SocialSsoSignInUpActionType;
  isGlobalScope?: boolean;
}) => {
  const { t } = useLingui();
  const signInUpStep = useAtomStateValue(signInUpStepState);
  const [lastAuthenticatedMethod, setLastAuthenticatedMethod] = useAtomState(
    lastAuthenticatedMethodState,
  );
  const { signInWithGoogle } = useSignInWithGoogle();
  const hasMultipleAuthMethods = useHasMultipleAuthMethods();

  const handleClick = () => {
    setLastAuthenticatedMethod(AuthenticatedMethod.GOOGLE);
    signInWithGoogle({ action });
  };

  const isLastUsed = lastAuthenticatedMethod === AuthenticatedMethod.GOOGLE;

  return (
    <>
      <StyledSsoButtonContainer>
        <Button
          className={BUTTON_ACTION_CLASS_NAME}
          startIcon={isDefined(GoogleIcon) ? <GoogleIcon /> : undefined}
          onClick={handleClick}
          fullWidth
          elevated
          variant={signInUpStep === SignInUpStep.Init ? 'solid' : 'outline'}
        >{t`Continue with Google`}</Button>
        {isLastUsed && (isGlobalScope || hasMultipleAuthMethods) && (
          <LastUsedPill />
        )}
      </StyledSsoButtonContainer>
      <HorizontalSeparator visible={false} />
    </>
  );
};
