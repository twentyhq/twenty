import { CombinedGraphQLErrors } from '@apollo/client/errors';
import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, waitFor } from '@testing-library/react';
import { Provider as JotaiProvider } from 'jotai';
import { SOURCE_LOCALE } from 'twenty-shared/translations';

import { TwoFactorAuthenticationSetupEffect } from '@/auth/components/TwoFactorAuthenticationProvisionEffect';
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

const mockInitiateCurrentUserWorkspaceOtpProvisioning = jest.fn();
const mockEnqueueToast = jest.fn();

jest.mock(
  '@/settings/two-factor-authentication/hooks/useCurrentUserWorkspaceTwoFactorAuthentication',
  () => ({
    useCurrentUserWorkspaceTwoFactorAuthentication: () => ({
      initiateCurrentUserWorkspaceOtpProvisioning:
        mockInitiateCurrentUserWorkspaceOtpProvisioning,
    }),
  }),
);

jest.mock('@/domain-manager/hooks/useOrigin', () => ({
  useOrigin: () => ({ origin: 'https://apple.twenty.com' }),
}));

jest.mock('~/hooks/useNavigateApp', () => ({
  useNavigateApp: () => jest.fn(),
}));

jest.mock('twenty-ui/components/feedback', () => ({
  ...jest.requireActual('twenty-ui/components/feedback'),
  useToast: () => ({ enqueueToast: mockEnqueueToast }),
}));

dynamicActivate(SOURCE_LOCALE);

const renderEffect = () =>
  render(
    <JotaiProvider store={jotaiStore}>
      <I18nProvider i18n={i18n}>
        <TwoFactorAuthenticationSetupEffect />
      </I18nProvider>
    </JotaiProvider>,
  );

describe('TwoFactorAuthenticationSetupEffect', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetJotaiStore();
    jotaiStore.set(loginTokenState.atom, 'login-token');
    jotaiStore.set(
      signInUpStepState.atom,
      SignInUpStep.TwoFactorAuthenticationProvision,
    );
  });

  it('shows the authenticator returned by the server', async () => {
    const uri =
      'otpauth://totp/Twenty:test@example.com?secret=SECRETKEY&issuer=Twenty';

    mockInitiateCurrentUserWorkspaceOtpProvisioning.mockResolvedValue({
      data: { initiateOTPProvisioning: { uri } },
    });

    renderEffect();

    await waitFor(() => expect(jotaiStore.get(qrCodeState.atom)).toBe(uri));
  });

  it('sends the member to the recovery code step when setup is reserved for a recovery', async () => {
    mockInitiateCurrentUserWorkspaceOtpProvisioning.mockRejectedValue(
      new CombinedGraphQLErrors({
        errors: [
          {
            message: 'RECOVERY_ENROLLMENT_RESTRICTED',
            extensions: {
              subCode: 'RECOVERY_ENROLLMENT_RESTRICTED',
              userFriendlyMessage:
                'Ask a workspace admin for a new recovery code to finish setting up two-factor authentication.',
            },
          },
        ],
      }),
    );

    renderEffect();

    await waitFor(() =>
      expect(jotaiStore.get(signInUpStepState.atom)).toBe(
        SignInUpStep.TwoFactorAuthenticationRecovery,
      ),
    );
    expect(mockEnqueueToast).toHaveBeenCalledWith(
      expect.objectContaining({
        variant: 'error',
        children:
          'Ask a workspace admin for a new recovery code to finish setting up two-factor authentication.',
      }),
    );
    expect(jotaiStore.get(qrCodeState.atom)).toBeNull();
  });
});
