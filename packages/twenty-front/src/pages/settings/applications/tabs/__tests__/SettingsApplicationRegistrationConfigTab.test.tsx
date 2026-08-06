import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { useQuery } from '@apollo/client/react';
import { render, screen } from '@testing-library/react';

import { type ApplicationRegistrationData } from '~/pages/settings/applications/tabs/types/ApplicationRegistrationData';
import { SettingsApplicationRegistrationConfigTab } from '~/pages/settings/applications/tabs/SettingsApplicationRegistrationConfigTab';

jest.mock('@apollo/client/react', () => ({
  useQuery: jest.fn(),
  useMutation: jest.fn(() => [jest.fn()]),
}));

jest.mock('@/settings/admin-panel/apollo/hooks/useApolloAdminClient', () => ({
  useApolloAdminClient: jest.fn(() => ({})),
}));

const mockedUseQuery = useQuery as unknown as jest.Mock;

const makeVariable = (
  overrides: Partial<{
    key: string;
    value: string | null;
    isDeprecated: boolean;
    isFilled: boolean;
  }>,
) => ({
  __typename: 'ApplicationRegistrationVariableDTO',
  id: 'variable-1',
  key: 'API_KEY',
  value: null,
  description: '',
  isSecret: false,
  isRequired: false,
  isDeprecated: false,
  isFilled: false,
  type: 'TEXT',
  options: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  ...overrides,
});

const mockVariables = (
  variables: ReturnType<typeof makeVariable>[],
  { fromAdmin }: { fromAdmin: boolean },
) =>
  mockedUseQuery.mockReturnValue({
    data: fromAdmin
      ? { findAdminApplicationRegistrationVariables: variables }
      : { findApplicationRegistrationVariables: variables },
  });

const renderTab = ({ fromAdmin }: { fromAdmin: boolean }) =>
  render(
    <I18nProvider i18n={i18n}>
      <SettingsApplicationRegistrationConfigTab
        registration={{ id: 'registration-1' } as ApplicationRegistrationData}
        fromAdmin={fromAdmin}
      />
    </I18nProvider>,
  );

describe('SettingsApplicationRegistrationConfigTab', () => {
  it.each([{ fromAdmin: false }, { fromAdmin: true }])(
    'hides a deprecated variable with no value (fromAdmin: $fromAdmin)',
    ({ fromAdmin }) => {
      mockVariables(
        [
          makeVariable({
            key: 'API_KEY',
            isDeprecated: true,
          }),
          makeVariable({ key: 'NEW_API_KEY' }),
        ],
        { fromAdmin },
      );

      renderTab({ fromAdmin });

      expect(screen.queryByText('API_KEY')).not.toBeInTheDocument();
      expect(screen.getByText('NEW_API_KEY')).toBeVisible();
    },
  );

  it('keeps a deprecated variable that still has a value and tags it', () => {
    mockVariables(
      [
        makeVariable({
          key: 'API_KEY',
          value: 'legacy-key',
          isDeprecated: true,
          isFilled: true,
        }),
      ],
      { fromAdmin: false },
    );

    renderTab({ fromAdmin: false });

    expect(screen.getByText('API_KEY')).toBeVisible();
    expect(screen.getByText('Deprecated')).toBeVisible();
  });

  it('does not render the section when every variable is filtered out', () => {
    mockVariables([makeVariable({ key: 'API_KEY', isDeprecated: true })], {
      fromAdmin: false,
    });

    renderTab({ fromAdmin: false });

    expect(screen.queryByText('Server Variables')).not.toBeInTheDocument();
  });
});
