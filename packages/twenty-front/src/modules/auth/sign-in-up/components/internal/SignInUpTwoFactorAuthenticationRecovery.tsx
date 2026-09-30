import { useAuth } from '@/auth/hooks/useAuth';
import { StyledTwoFactorInstructions } from '@/auth/sign-in-up/components/internal/SignInUpTwoFactorAuthenticationStyles';
import { loginTokenState } from '@/auth/states/loginTokenState';
import {
  SignInUpStep,
  signInUpStepState,
} from '@/auth/states/signInUpStepState';
import { getTwoFactorAuthenticationErrorToastOptions } from '@/auth/utils/getTwoFactorAuthenticationErrorToastOptions';
import { useReadCaptchaToken } from '@/captcha/hooks/useReadCaptchaToken';
import { useCaptcha } from '@/client-config/hooks/useCaptcha';
import { ONBOARDING_CONTENT_BLOCK_WIDTH } from '@/onboarding/constants/OnboardingContentBlockWidth';
import { SettingsTextInput } from '@/ui/input/components/SettingsTextInput';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { styled } from '@linaria/react';
import { Trans, useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { type FormEvent, useState } from 'react';
import { AppPath } from 'twenty-shared/types';
import { MainButton, useToast } from 'twenty-ui/components';
import { Button } from 'twenty-ui/primitives/input';
import { themeCssVariables } from 'twenty-ui/theme';
import { useNavigateApp } from '~/hooks/useNavigateApp';
import { isGraphqlErrorOfType } from '~/utils/is-graphql-error-of-type.util';

const StyledForm = styled.form`
  align-items: center;
  display: flex;
  flex-direction: column;
  max-width: 100%;
  width: ${ONBOARDING_CONTENT_BLOCK_WIDTH}px;
`;

const StyledInputContainer = styled.div`
  margin-bottom: ${themeCssVariables.spacing[4]};
  width: 100%;
`;

const StyledActionBackLinkContainer = styled.div`
  margin: ${themeCssVariables.spacing[3]} 0 0;
`;

export const SignInUpTwoFactorAuthenticationRecovery = () => {
  const [recoveryCode, setRecoveryCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { getAuthTokensFromTwoFactorAuthenticationRecoveryCode } = useAuth();
  const { enqueueToast } = useToast();
  const navigate = useNavigateApp();
  const { readCaptchaToken } = useReadCaptchaToken();
  const { isCaptchaReady } = useCaptcha();
  const loginToken = useAtomStateValue(loginTokenState);
  const setSignInUpStep = useSetAtomState(signInUpStepState);
  const { t } = useLingui();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!isCaptchaReady) {
      enqueueToast({
        variant: 'error',
        children: t`Captcha (anti-bot check) is still loading, try again`,
      });
      return;
    }

    if (!isNonEmptyString(loginToken)) {
      return navigate(AppPath.SignInUp);
    }

    setIsLoading(true);

    try {
      await getAuthTokensFromTwoFactorAuthenticationRecoveryCode(
        recoveryCode,
        loginToken,
        readCaptchaToken(),
      );

      enqueueToast({
        variant: 'info',
        children: t`Two-factor authentication was reset for this workspace. Set it up again from Settings, Profile.`,
      });
    } catch (error) {
      if (
        isGraphqlErrorOfType(
          error,
          'TWO_FACTOR_AUTHENTICATION_PROVISION_REQUIRED',
        )
      ) {
        setSignInUpStep(SignInUpStep.TwoFactorAuthenticationProvision);
        return;
      }

      enqueueToast(
        getTwoFactorAuthenticationErrorToastOptions({
          error,
          fallbackMessage: t`Invalid or expired recovery code.`,
        }),
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    setSignInUpStep(SignInUpStep.TwoFactorAuthenticationVerification);
  };

  return (
    <StyledForm onSubmit={handleSubmit}>
      <StyledTwoFactorInstructions>
        <Trans>
          Enter the recovery code a workspace admin gave you. Your current
          authenticator for this workspace will be removed.
        </Trans>
      </StyledTwoFactorInstructions>
      <StyledInputContainer>
        <SettingsTextInput
          instanceId="sign-in-up-two-factor-authentication-recovery-code"
          autoComplete="one-time-code"
          autoFocus
          value={recoveryCode}
          placeholder="XXXXX-XXXXX-XXXXX-XXXXX"
          onChange={setRecoveryCode}
          fullWidth
        />
      </StyledInputContainer>
      <MainButton
        type="submit"
        fullWidth
        disabled={isLoading || !isNonEmptyString(recoveryCode.trim())}
      >{t`Continue`}</MainButton>
      <StyledActionBackLinkContainer>
        <Button variant="link" onClick={handleBack}>
          <Trans>Back</Trans>
        </Button>
      </StyledActionBackLinkContainer>
    </StyledForm>
  );
};
