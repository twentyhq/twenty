import { MockedProvider } from '@apollo/client/testing/react';
import { render, screen } from '@testing-library/react';
import { type ReactNode } from 'react';
import { I18nProvider } from '@lingui/react';
import { i18n } from '@lingui/core';

import { EmailComposerFields } from '@/activities/emails/components/EmailComposerFields';
import { type EmailComposerState } from '@/activities/emails/types/EmailComposerState';
import { GET_MY_CONNECTED_ACCOUNTS } from '@/settings/accounts/graphql/queries/getMyConnectedAccounts';

jest.mock(
  '@/advanced-text-editor/components/FormAdvancedTextFieldInput',
  () => ({
    FormAdvancedTextFieldInput: () => null,
  }),
);

jest.mock(
  '@/activities/emails/recipients/components/EmailRecipientsFieldInput',
  () => ({ EmailRecipientsFieldInput: () => null }),
);

jest.mock('@/activities/emails/hooks/useUploadEmailImage', () => ({
  useUploadEmailImage: () => ({ uploadEmailImage: jest.fn() }),
}));

const createAccountsMock = (
  accounts: { id: string; handle: string; handleAliases: string[] }[],
) => ({
  request: { query: GET_MY_CONNECTED_ACCOUNTS },
  result: {
    data: {
      myConnectedAccounts: accounts.map((account) => ({
        __typename: 'ConnectedAccountDTO',
        provider: 'google',
        authFailedAt: null,
        authFailedReason: null,
        archivedAt: null,
        scopes: ['https://www.googleapis.com/auth/gmail.send'],
        lastSignedInAt: null,
        userWorkspaceId: 'user-workspace-1',
        connectionProviderId: null,
        applicationId: null,
        name: null,
        scope: null,
        lastCredentialsRefreshedAt: null,
        connectionParameters: null,
        createdAt: '2026-01-01T00:00:00.000Z',
        updatedAt: '2026-01-01T00:00:00.000Z',
        ...account,
      })),
    },
  },
});

const composerState = {
  connectedAccountId: 'account-1',
  fromHandle: 'jane@example.com',
  setSender: jest.fn(),
  to: [],
  cc: [],
  bcc: [],
  files: [],
  showCcBcc: false,
  exceedsRecipientLimit: false,
  recipientCount: 0,
  maxRecipients: 100,
  initialSubject: '',
  initialBody: '',
} as unknown as EmailComposerState;

const Wrapper = ({ children }: { children: ReactNode }) => (
  <I18nProvider i18n={i18n}>
    <MockedProvider
      mocks={[
        createAccountsMock([
          {
            id: 'account-1',
            handle: 'jane@example.com',
            handleAliases: [],
          },
        ]),
      ]}
    >
      {children}
    </MockedProvider>
  </I18nProvider>
);

describe('EmailComposerFields', () => {
  it('shows the from address as text when there is a single sender', async () => {
    render(<EmailComposerFields composerState={composerState} />, {
      wrapper: Wrapper,
    });

    expect(await screen.findByText('jane@example.com')).toBeVisible();
    expect(screen.getByText('From')).toBeInTheDocument();
  });
});
