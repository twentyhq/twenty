import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { MockedProvider } from '@apollo/client/testing/react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider as JotaiProvider } from 'jotai';
import { Suspense } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { ToastProvider } from 'twenty-ui/components/feedback';

import { currentUserWorkspaceState } from '@/auth/states/currentUserWorkspaceState';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { isClickHouseConfiguredState } from '@/client-config/states/isClickHouseConfiguredState';
import { LogConsole } from '@/log-console/components/LogConsole';
import { logConsoleDisplayModeState } from '@/log-console/states/logConsoleDisplayModeState';
import { useSetAdvancedMode } from '@/navigation/hooks/useSetAdvancedMode';
import { isAdvancedModeEnabledState } from '@/ui/navigation/navigation-drawer/states/isAdvancedModeEnabledState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import {
  jotaiStore,
  resetJotaiStore,
} from '@/ui/utilities/state/jotai/jotaiStore';
import {
  FeatureFlagKey,
  PermissionFlagType,
} from '~/generated-metadata/graphql';
import {
  mockCurrentWorkspace,
  mockedUserData,
} from '~/testing/mock-data/users';

jest.mock('@/log-console/components/LogConsoleResults', () => ({
  LogConsoleResults: () => <div>Log results</div>,
}));

jest.mock('@/log-console/components/LogConsoleDetailPanel', () => ({
  LogConsoleDetailPanel: () => null,
}));

const DeveloperModeSwitch = () => {
  const isAdvancedModeEnabled = useAtomStateValue(isAdvancedModeEnabledState);
  const { setAdvancedMode } = useSetAdvancedMode();

  return (
    <button
      type="button"
      onClick={() => setAdvancedMode(!isAdvancedModeEnabled)}
    >
      Developer mode
    </button>
  );
};

const renderWithLogsFeatureFlag = (isLogsFeatureFlagEnabled: boolean) => {
  resetJotaiStore();
  jotaiStore.set(currentWorkspaceState.atom, {
    ...mockCurrentWorkspace,
    featureFlags: [
      {
        key: FeatureFlagKey.IS_LOGS_SETTINGS_SECTION_ENABLED,
        value: isLogsFeatureFlagEnabled,
      },
    ],
  });
  jotaiStore.set(currentUserWorkspaceState.atom, {
    ...mockedUserData.currentUserWorkspace,
    permissionFlags: [PermissionFlagType.SECURITY],
  });
  jotaiStore.set(isClickHouseConfiguredState.atom, true);
  jotaiStore.set(isAdvancedModeEnabledState.atom, false);
  jotaiStore.set(logConsoleDisplayModeState.atom, 'closed');

  render(
    <I18nProvider i18n={i18n}>
      <JotaiProvider store={jotaiStore}>
        <ToastProvider>
          <MockedProvider>
            <MemoryRouter>
              <Suspense fallback={null}>
                <DeveloperModeSwitch />
                <LogConsole />
              </Suspense>
            </MemoryRouter>
          </MockedProvider>
        </ToastProvider>
      </JotaiProvider>
    </I18nProvider>,
  );
};

describe('LogConsole', () => {
  it('opens when developer mode is turned on', async () => {
    renderWithLogsFeatureFlag(true);

    expect(screen.queryByText('Log results')).not.toBeInTheDocument();

    await userEvent.click(
      await screen.findByRole('button', { name: 'Developer mode' }),
    );

    expect(await screen.findByText('Log results')).toBeInTheDocument();
  });

  it('stays hidden when the logs feature flag is off', async () => {
    renderWithLogsFeatureFlag(false);

    await userEvent.click(
      await screen.findByRole('button', { name: 'Developer mode' }),
    );

    expect(screen.queryByText('Log results')).not.toBeInTheDocument();
  });
});
