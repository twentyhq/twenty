import { type MockedResponse } from '@apollo/client/testing';
import { MockedProvider } from '@apollo/client/testing/react';
import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen } from '@testing-library/react';
import { createStore, Provider } from 'jotai';
import { SOURCE_LOCALE } from 'twenty-shared/translations';
import { ThemeProvider } from 'twenty-ui/theme';

import { TwoFactorAuthenticationBackupCodesSection } from '@/settings/two-factor-authentication/components/TwoFactorAuthenticationBackupCodesSection';
import { TwoFactorAuthenticationBackupCodeStatusDocument } from '~/generated-metadata/graphql';
import { dynamicActivate } from '~/utils/i18n/dynamicActivate';

jest.mock('twenty-ui/components/feedback', () => ({
  ...jest.requireActual('twenty-ui/components/feedback'),
  useToast: () => ({ enqueueToast: jest.fn() }),
}));

dynamicActivate(SOURCE_LOCALE);

const BACKUP_CODES = ['ABCDE-FGHJK-MNPQR-STVWX', '01234-56789-ABCDE-FGHJK'];

const statusMock = (remainingBackupCodeCount: number): MockedResponse => ({
  request: { query: TwoFactorAuthenticationBackupCodeStatusDocument },
  result: {
    data: {
      twoFactorAuthenticationBackupCodeStatus: {
        __typename: 'TwoFactorAuthenticationBackupCodeStatus',
        remainingBackupCodeCount,
      },
    },
  },
});

const renderSection = ({
  remainingBackupCodeCount,
  generatedBackupCodes = null,
}: {
  remainingBackupCodeCount: number;
  generatedBackupCodes?: string[] | null;
}) =>
  render(
    <Provider store={createStore()}>
      <MockedProvider mocks={[statusMock(remainingBackupCodeCount)]}>
        <ThemeProvider colorScheme="light">
          <I18nProvider i18n={i18n}>
            <TwoFactorAuthenticationBackupCodesSection
              generatedBackupCodes={generatedBackupCodes}
              onBackupCodesGenerated={jest.fn()}
            />
          </I18nProvider>
        </ThemeProvider>
      </MockedProvider>
    </Provider>,
  );

it('shows how many backup codes are left and offers to replace them', async () => {
  renderSection({ remainingBackupCodeCount: 9 });

  expect(await screen.findByText('9 backup codes left')).toBeInTheDocument();
  expect(
    screen.getByRole('button', { name: 'Generate new codes' }),
  ).toBeInTheDocument();
});

it('offers to generate backup codes when the member has none', async () => {
  renderSection({ remainingBackupCodeCount: 0 });

  expect(await screen.findByText('0 backup codes left')).toBeInTheDocument();
  expect(
    screen.getByRole('button', { name: 'Generate backup codes' }),
  ).toBeInTheDocument();
});

it('shows freshly generated codes once with copy and download actions', async () => {
  renderSection({
    remainingBackupCodeCount: 10,
    generatedBackupCodes: BACKUP_CODES,
  });

  for (const backupCode of BACKUP_CODES) {
    expect(screen.getByText(backupCode)).toBeInTheDocument();
  }
  expect(screen.getByRole('button', { name: 'Copy' })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: 'Download' })).toBeInTheDocument();
  expect(
    screen.getByText(/You won't be able to see them again/),
  ).toBeInTheDocument();
});
