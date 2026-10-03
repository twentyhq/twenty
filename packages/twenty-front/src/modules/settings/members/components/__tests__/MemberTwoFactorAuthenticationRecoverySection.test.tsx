import { type MockedResponse } from '@apollo/client/testing';
import { MockedProvider } from '@apollo/client/testing/react';
import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createStore, Provider } from 'jotai';
import { SOURCE_LOCALE } from 'twenty-shared/translations';
import { ThemeProvider } from 'twenty-ui/theme';

import { MemberTwoFactorAuthenticationRecoverySection } from '@/settings/members/components/MemberTwoFactorAuthenticationRecoverySection';
import {
  RevokeTwoFactorAuthenticationRecoveryCodeDocument,
  TwoFactorAuthenticationRecoveryStatusDocument,
} from '~/generated-metadata/graphql';
import { dynamicActivate } from '~/utils/i18n/dynamicActivate';

const enqueueToast = jest.fn();

jest.mock('twenty-ui/components', () => ({
  ...jest.requireActual('twenty-ui/components'),
  useToast: () => ({ enqueueToast }),
}));

dynamicActivate(SOURCE_LOCALE);

const USER_ID = '20202020-3957-4908-9c36-2929a23f8357';

const statusMock = ({
  hasVerifiedTwoFactorAuthenticationMethod,
  pendingRecoveryCodeExpiresAt,
}: {
  hasVerifiedTwoFactorAuthenticationMethod: boolean;
  pendingRecoveryCodeExpiresAt: string | null;
}): MockedResponse => ({
  request: {
    query: TwoFactorAuthenticationRecoveryStatusDocument,
    variables: { userId: USER_ID },
  },
  result: {
    data: {
      twoFactorAuthenticationRecoveryStatus: {
        __typename: 'TwoFactorAuthenticationRecoveryStatus',
        hasVerifiedTwoFactorAuthenticationMethod,
        pendingRecoveryCodeExpiresAt,
      },
    },
  },
});

const renderSection = (mocks: MockedResponse[]) =>
  render(
    <Provider store={createStore()}>
      <MockedProvider mocks={mocks}>
        <ThemeProvider colorScheme="light">
          <I18nProvider i18n={i18n}>
            <MemberTwoFactorAuthenticationRecoverySection
              userId={USER_ID}
              memberName="Jony Ive"
            />
          </I18nProvider>
        </ThemeProvider>
      </MockedProvider>
    </Provider>,
  );

beforeEach(() => jest.clearAllMocks());

it('explains that there is nothing to recover when the member has no authenticator', async () => {
  renderSection([
    statusMock({
      hasVerifiedTwoFactorAuthenticationMethod: false,
      pendingRecoveryCodeExpiresAt: null,
    }),
  ]);

  expect(
    await screen.findByText(
      "This member hasn't set up two-factor authentication.",
    ),
  ).toBeInTheDocument();
  expect(
    screen.queryByRole('button', { name: 'Generate recovery code' }),
  ).not.toBeInTheDocument();
});

it('shows a pending code and revokes it', async () => {
  const revoke = jest.fn(() => ({
    data: { revokeTwoFactorAuthenticationRecoveryCode: true },
  }));

  renderSection([
    statusMock({
      hasVerifiedTwoFactorAuthenticationMethod: true,
      pendingRecoveryCodeExpiresAt: new Date(
        Date.now() + 60 * 60 * 1000,
      ).toISOString(),
    }),
    {
      request: {
        query: RevokeTwoFactorAuthenticationRecoveryCodeDocument,
        variables: { userId: USER_ID },
      },
      result: revoke,
    },
    statusMock({
      hasVerifiedTwoFactorAuthenticationMethod: true,
      pendingRecoveryCodeExpiresAt: null,
    }),
  ]);

  const user = userEvent.setup();

  await user.click(await screen.findByRole('button', { name: 'Revoke' }));

  await waitFor(() =>
    expect(
      screen.queryByRole('button', { name: 'Revoke' }),
    ).not.toBeInTheDocument(),
  );
  expect(revoke).toHaveBeenCalledTimes(1);
  expect(enqueueToast).toHaveBeenCalledWith(
    expect.objectContaining({ variant: 'success' }),
  );
});
