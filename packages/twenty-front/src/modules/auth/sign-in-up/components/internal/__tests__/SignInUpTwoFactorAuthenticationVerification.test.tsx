import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider as JotaiProvider } from 'jotai';
import { SOURCE_LOCALE } from 'twenty-shared/translations';
import { ThemeProvider } from 'twenty-ui/theme';

import { SignInUpTOTPVerification } from '@/auth/sign-in-up/components/internal/SignInUpTwoFactorAuthenticationVerification';
import { loginTokenState } from '@/auth/states/loginTokenState';
import { qrCodeState } from '@/auth/states/qrCode';
import {
  SignInUpStep,
  signInUpStepState,
} from '@/auth/states/signInUpStepState';
import {
  jotaiStore,
  resetJotaiStore,
} from '@/ui/utilities/state/jotai/jotaiStore';
import { dynamicActivate } from '~/utils/i18n/dynamicActivate';

jest.mock('@/auth/hooks/useAuth', () => ({
  useAuth: () => ({ getAuthTokensFromOTP: jest.fn() }),
}));

jest.mock('@/captcha/hooks/useGetCaptchaToken', () => ({
  useGetCaptchaToken: () => ({ getCaptchaToken: async () => 'captcha-token' }),
}));

jest.mock('~/hooks/useNavigateApp', () => ({
  useNavigateApp: () => jest.fn(),
}));

jest.mock('twenty-ui/components/feedback', () => ({
  ...jest.requireActual('twenty-ui/components/feedback'),
  useToast: () => ({ enqueueToast: jest.fn() }),
}));

dynamicActivate(SOURCE_LOCALE);

const renderVerificationStep = () =>
  render(
    <JotaiProvider store={jotaiStore}>
      <ThemeProvider colorScheme="light">
        <I18nProvider i18n={i18n}>
          <SignInUpTOTPVerification />
        </I18nProvider>
      </ThemeProvider>
    </JotaiProvider>,
  );

describe('SignInUpTOTPVerification', () => {
  // jsdom lacks elementFromPoint, which input-otp probes for password manager badges
  beforeAll(() => {
    document.elementFromPoint = () => null;
  });

  beforeEach(() => {
    resetJotaiStore();
    jotaiStore.set(loginTokenState.atom, 'login-token');
    jotaiStore.set(
      signInUpStepState.atom,
      SignInUpStep.TwoFactorAuthenticationVerification,
    );
  });

  it('goes back to the authenticator setup when it was just provisioned', async () => {
    jotaiStore.set(
      qrCodeState.atom,
      'otpauth://totp/Twenty:test@example.com?secret=SECRETKEY&issuer=Twenty',
    );

    renderVerificationStep();
    await userEvent.setup().click(screen.getByRole('button', { name: 'Back' }));

    expect(jotaiStore.get(signInUpStepState.atom)).toBe(
      SignInUpStep.TwoFactorAuthenticationProvision,
    );
  });

  it('goes back to the start of sign in when two-factor authentication was already set up', async () => {
    renderVerificationStep();
    await userEvent.setup().click(screen.getByRole('button', { name: 'Back' }));

    expect(jotaiStore.get(signInUpStepState.atom)).toBe(SignInUpStep.Init);
  });

  it('opens the recovery step from the lost authenticator link', async () => {
    renderVerificationStep();
    await userEvent
      .setup()
      .click(screen.getByRole('button', { name: 'Lost your authenticator?' }));

    expect(jotaiStore.get(signInUpStepState.atom)).toBe(
      SignInUpStep.TwoFactorAuthenticationRecovery,
    );
  });
});
