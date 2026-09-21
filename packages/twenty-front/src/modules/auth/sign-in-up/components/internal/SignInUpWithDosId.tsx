import { useHasMultipleAuthMethods } from '@/auth/sign-in-up/hooks/useHasMultipleAuthMethods';
import { useSignInWithDosId } from '@/auth/sign-in-up/hooks/useSignInWithDosId';
import { lastAuthenticatedMethodState } from '@/auth/states/lastAuthenticatedMethodState';
import {
  SignInUpStep,
  signInUpStepState,
} from '@/auth/states/signInUpStepState';
import { AuthenticatedMethod } from '@/auth/types/AuthenticatedMethod.enum';
import { type SocialSsoSignInUpActionType } from '@/auth/types/socialSsoSignInUp.type';
import { useLingui } from '@lingui/react/macro';
import { memo, useContext } from 'react';
import { IconDos } from 'twenty-ui/icon';
import { MainButton } from 'twenty-ui/components';
import { HorizontalSeparator } from 'twenty-ui/primitives/layout';
import { useAtomState } from '@/ui/utilities/state/jotai/hooks/useAtomState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { LastUsedPill } from './LastUsedPill';
import { StyledSsoButtonContainer } from './SignInUpSsoButtonStyles';
import { ThemeContext } from 'twenty-ui/theme-constants';

const DosIdIcon = memo(() => {
  const { theme } = useContext(ThemeContext);
  return <IconDos size={theme.icon.size.md} />;
});

export const SignInUpWithDosId = ({
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
  const { signInWithDosId } = useSignInWithDosId();
  const hasMultipleAuthMethods = useHasMultipleAuthMethods();

  const handleClick = () => {
    setLastAuthenticatedMethod(AuthenticatedMethod.DOS_ID);
    signInWithDosId({ action });
  };

  const isLastUsed = lastAuthenticatedMethod === AuthenticatedMethod.DOS_ID;

  return (
    <>
      <StyledSsoButtonContainer>
        <MainButton
          startIcon={<DosIdIcon />}
          onClick={handleClick}
          fullWidth
          variant={signInUpStep === SignInUpStep.Init ? 'solid' : 'outline'}
        >{t`Continue with DOS ID`}</MainButton>
        {isLastUsed && (isGlobalScope || hasMultipleAuthMethods) && (
          <LastUsedPill />
        )}
      </StyledSsoButtonContainer>
      <HorizontalSeparator visible={false} />
    </>
  );
};
