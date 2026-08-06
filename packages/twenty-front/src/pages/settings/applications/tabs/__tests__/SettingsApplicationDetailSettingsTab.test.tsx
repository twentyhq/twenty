import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen } from '@testing-library/react';

import { type Application } from '~/generated-metadata/graphql';
import { SettingsApplicationDetailSettingsTab } from '~/pages/settings/applications/tabs/SettingsApplicationDetailSettingsTab';

jest.mock(
  '~/pages/settings/applications/hooks/useUpdateOneApplicationVariable',
  () => ({
    useUpdateOneApplicationVariable: jest.fn(() => ({
      updateOneApplicationVariable: jest.fn(),
    })),
  }),
);

jest.mock(
  '~/pages/settings/applications/tabs/SettingsApplicationConnectionsSection',
  () => ({
    SettingsApplicationConnectionsSection: () => null,
  }),
);

jest.mock(
  '~/pages/settings/applications/tabs/SettingsApplicationGeneralSection',
  () => ({
    SettingsApplicationGeneralSection: () => null,
  }),
);

jest.mock(
  '~/pages/settings/applications/tabs/SettingsApplicationFunctionDomainSection',
  () => ({
    SettingsApplicationFunctionDomainSection: () => null,
  }),
);

const makeApplicationVariable = (
  overrides: Partial<{
    id: string;
    key: string;
    value: string;
    isDeprecated: boolean;
  }>,
) => ({
  __typename: 'ApplicationVariable' as const,
  id: 'variable-1',
  key: 'API_KEY',
  value: '',
  description: '',
  isSecret: false,
  isDeprecated: false,
  type: 'TEXT',
  options: null,
  ...overrides,
});

const renderTab = (
  applicationVariables: ReturnType<typeof makeApplicationVariable>[],
) =>
  render(
    <I18nProvider i18n={i18n}>
      <SettingsApplicationDetailSettingsTab
        application={
          {
            id: 'app-1',
            applicationVariables,
            logicFunctions: [],
          } as unknown as Application
        }
      />
    </I18nProvider>,
  );

describe('SettingsApplicationDetailSettingsTab', () => {
  it('hides a deprecated application variable with no value', () => {
    renderTab([
      makeApplicationVariable({
        id: 'variable-1',
        key: 'API_KEY',
        isDeprecated: true,
      }),
      makeApplicationVariable({ id: 'variable-2', key: 'NEW_API_KEY' }),
    ]);

    expect(screen.queryByText('API_KEY')).not.toBeInTheDocument();
    expect(screen.getByText('NEW_API_KEY')).toBeVisible();
  });

  it('keeps a deprecated application variable that still has a value and tags it', () => {
    renderTab([
      makeApplicationVariable({
        id: 'variable-1',
        key: 'API_KEY',
        value: 'legacy-key',
        isDeprecated: true,
      }),
    ]);

    expect(screen.getByText('API_KEY')).toBeVisible();
    expect(screen.getByText('Deprecated')).toBeVisible();
  });
});
