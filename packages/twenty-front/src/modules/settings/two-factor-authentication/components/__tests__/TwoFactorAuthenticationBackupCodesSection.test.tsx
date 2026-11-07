import { type MockedResponse } from '@apollo/client/testing';
import { MockedProvider } from '@apollo/client/testing/react';
import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createStore, Provider } from 'jotai';
import { SOURCE_LOCALE } from 'twenty-shared/translations';
import { ThemeProvider } from 'twenty-ui/theme';

import { TwoFactorAuthenticationBackupCodesSection } from '@/settings/two-factor-authentication/components/TwoFactorAuthenticationBackupCodesSection';
import {
  GenerateTwoFactorAuthenticationBackupCodesDocument,
  TwoFactorAuthenticationBackupCodeStatusDocument,
} from '~/generated-metadata/graphql';
import { dynamicActivate } from '~/utils/i18n/dynamicActivate';

const enqueueToast = jest.fn();

jest.mock('twenty-ui/components/feedback', () => ({
  ...jest.requireActual('twenty-ui/components/feedback'),
  useToast: () => ({ enqueueToast }),
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
  onBackupCodesGenerated = jest.fn(),
  additionalMocks = [],
}: {
  remainingBackupCodeCount: number;
  generatedBackupCodes?: string[] | null;
  onBackupCodesGenerated?: (backupCodes: string[]) => void;
  additionalMocks?: MockedResponse[];
}) =>
  render(
    <Provider store={createStore()}>
      <MockedProvider
        mocks={[statusMock(remainingBackupCodeCount), ...additionalMocks]}
      >
        <ThemeProvider colorScheme="light">
          <I18nProvider i18n={i18n}>
            <TwoFactorAuthenticationBackupCodesSection
              generatedBackupCodes={generatedBackupCodes}
              onBackupCodesGenerated={onBackupCodesGenerated}
            />
          </I18nProvider>
        </ThemeProvider>
      </MockedProvider>
    </Provider>,
  );

// jsdom lacks elementFromPoint, which input-otp probes for password manager badges
beforeAll(() => {
  document.elementFromPoint = () => null;
});

beforeEach(() => jest.clearAllMocks());

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

it('keeps newly generated codes without an error when the count refresh fails', async () => {
  const onBackupCodesGenerated = jest.fn();

  renderSection({
    remainingBackupCodeCount: 3,
    onBackupCodesGenerated,
    additionalMocks: [
      {
        request: {
          query: GenerateTwoFactorAuthenticationBackupCodesDocument,
          variables: { otp: '123456' },
        },
        result: {
          data: {
            generateTwoFactorAuthenticationBackupCodes: {
              __typename: 'TwoFactorAuthenticationBackupCodes',
              backupCodes: BACKUP_CODES,
            },
          },
        },
      },
      {
        request: { query: TwoFactorAuthenticationBackupCodeStatusDocument },
        error: new Error('Network error'),
      },
    ],
  });

  const user = userEvent.setup();

  await user.click(
    await screen.findByRole('button', { name: 'Generate new codes' }),
  );
  await user.keyboard('123456');
  await user.click(screen.getByRole('button', { name: 'Generate codes' }));

  await waitFor(() =>
    expect(onBackupCodesGenerated).toHaveBeenCalledWith(BACKUP_CODES),
  );
  await act(() => new Promise((resolve) => setTimeout(resolve, 50)));
  expect(enqueueToast).not.toHaveBeenCalled();
});
