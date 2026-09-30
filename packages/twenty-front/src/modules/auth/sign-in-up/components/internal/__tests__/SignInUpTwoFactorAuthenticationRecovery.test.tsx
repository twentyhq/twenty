import { CombinedGraphQLErrors } from '@apollo/client/errors';
import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider as JotaiProvider } from 'jotai';
import { SOURCE_LOCALE } from 'twenty-shared/translations';
import { ThemeProvider } from 'twenty-ui/theme';

import { SignInUpTwoFactorAuthenticationRecovery } from '@/auth/sign-in-up/components/internal/SignInUpTwoFactorAuthenticationRecovery';
import { loginTokenState } from '@/auth/states/loginTokenState';
import {
  SignInUpStep,
  signInUpStepState,
} from '@/auth/states/signInUpStepState';
import {
  jotaiStore,
  resetJotaiStore,
} from '@/ui/utilities/state/jotai/jotaiStore';
import { dynamicActivate } from '~/utils/i18n/dynamicActivate';

const mockGetAuthTokensFromTwoFactorAuthenticationRecoveryCode = jest.fn();
const mockEnqueueToast = jest.fn();

jest.mock('@/auth/hooks/useAuth', () => ({
  useAuth: () => ({
    getAuthTokensFromTwoFactorAuthenticationRecoveryCode:
      mockGetAuthTokensFromTwoFactorAuthenticationRecoveryCode,
  }),
}));

jest.mock('@/captcha/hooks/useReadCaptchaToken', () => ({
  useReadCaptchaToken: () => ({ readCaptchaToken: () => 'captcha-token' }),
}));

jest.mock('@/client-config/hooks/useCaptcha', () => ({
  useCaptcha: () => ({ isCaptchaReady: true }),
}));

jest.mock('~/hooks/useNavigateApp', () => ({
  useNavigateApp: () => jest.fn(),
}));

jest.mock('twenty-ui/components', () => ({
  ...jest.requireActual('twenty-ui/components'),
  useToast: () => ({ enqueueToast: mockEnqueueToast }),
}));

dynamicActivate(SOURCE_LOCALE);

const buildGraphqlError = (
  subCode: string,
  userFriendlyMessage: string,
): CombinedGraphQLErrors =>
  new CombinedGraphQLErrors({
    errors: [
      {
        message: subCode,
        extensions: { subCode, userFriendlyMessage },
      },
    ],
  });

const renderRecoveryStep = () =>
  render(
    <JotaiProvider store={jotaiStore}>
      <ThemeProvider colorScheme="light">
        <I18nProvider i18n={i18n}>
          <SignInUpTwoFactorAuthenticationRecovery />
        </I18nProvider>
      </ThemeProvider>
    </JotaiProvider>,
  );

const submitRecoveryCode = async (recoveryCode: string) => {
  const user = userEvent.setup();

  await user.type(
    screen.getByPlaceholderText('XXXXX-XXXXX-XXXXX-XXXXX'),
    recoveryCode,
  );
  await user.click(screen.getByRole('button', { name: 'Continue' }));
};

describe('SignInUpTwoFactorAuthenticationRecovery', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetJotaiStore();
    jotaiStore.set(loginTokenState.atom, 'login-token');
    jotaiStore.set(
      signInUpStepState.atom,
      SignInUpStep.TwoFactorAuthenticationRecovery,
    );
  });

  it('keeps the continue button disabled until a code is entered', () => {
    renderRecoveryStep();

    expect(screen.getByRole('button', { name: 'Continue' })).toBeDisabled();
  });

  it('signs in with the recovery code and reminds the member to set up two-factor authentication again', async () => {
    mockGetAuthTokensFromTwoFactorAuthenticationRecoveryCode.mockResolvedValue(
      undefined,
    );

    renderRecoveryStep();
    await submitRecoveryCode('ABCDE-FGHJK-MNPQR-STVWX');

    expect(
      mockGetAuthTokensFromTwoFactorAuthenticationRecoveryCode,
    ).toHaveBeenCalledWith(
      'ABCDE-FGHJK-MNPQR-STVWX',
      'login-token',
      'captcha-token',
    );
    expect(mockEnqueueToast).toHaveBeenCalledWith(
      expect.objectContaining({ variant: 'info' }),
    );
  });

  it('continues to the setup step when the workspace enforces two-factor authentication', async () => {
    mockGetAuthTokensFromTwoFactorAuthenticationRecoveryCode.mockRejectedValue(
      buildGraphqlError(
        'TWO_FACTOR_AUTHENTICATION_PROVISION_REQUIRED',
        'Two-factor authentication setup required.',
      ),
    );

    renderRecoveryStep();
    await submitRecoveryCode('ABCDE-FGHJK-MNPQR-STVWX');

    expect(jotaiStore.get(signInUpStepState.atom)).toBe(
      SignInUpStep.TwoFactorAuthenticationProvision,
    );
    expect(jotaiStore.get(loginTokenState.atom)).toBe('login-token');
    expect(mockEnqueueToast).not.toHaveBeenCalled();
  });

  it('shows the server message when the code is rejected', async () => {
    mockGetAuthTokensFromTwoFactorAuthenticationRecoveryCode.mockRejectedValue(
      buildGraphqlError(
        'INVALID_RECOVERY_CODE',
        'Invalid or expired recovery code.',
      ),
    );

    renderRecoveryStep();
    await submitRecoveryCode('WRONG-CODE0-00000-00000');

    expect(mockEnqueueToast).toHaveBeenCalledWith(
      expect.objectContaining({
        variant: 'error',
        children: 'Invalid or expired recovery code.',
      }),
    );
    expect(jotaiStore.get(signInUpStepState.atom)).toBe(
      SignInUpStep.TwoFactorAuthenticationRecovery,
    );
  });

  it('goes back to the authenticator code step', async () => {
    const user = userEvent.setup();

    renderRecoveryStep();
    await user.click(screen.getByText('Back'));

    expect(jotaiStore.get(signInUpStepState.atom)).toBe(
      SignInUpStep.TwoFactorAuthenticationVerification,
    );
  });
});
