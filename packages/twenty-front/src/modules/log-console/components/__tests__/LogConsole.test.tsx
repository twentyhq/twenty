import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { MockedProvider } from '@apollo/client/testing/react';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider as JotaiProvider } from 'jotai';
import { Suspense } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { ToastProvider } from 'twenty-ui/components/feedback';
import { type ResizablePanelProps } from 'twenty-ui/components';

import { currentUserWorkspaceState } from '@/auth/states/currentUserWorkspaceState';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { isClickHouseConfiguredState } from '@/client-config/states/isClickHouseConfiguredState';
import { LogConsole } from '@/log-console/components/LogConsole';
import { LOG_CONSOLE_HEIGHT_CONSTRAINTS } from '@/log-console/constants/LogConsoleHeightConstraints';
import { isLogConsoleFullScreenState } from '@/log-console/states/isLogConsoleFullScreenState';
import { logConsoleDisplayModeState } from '@/log-console/states/logConsoleDisplayModeState';
import { logConsoleHeightState } from '@/log-console/states/logConsoleHeightState';
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

let capturedResizablePanelProps: ResizablePanelProps | undefined;

jest.mock('twenty-ui/components', () => ({
  ...jest.requireActual('twenty-ui/components'),
  ResizablePanel: (props: ResizablePanelProps) => {
    capturedResizablePanelProps = props;
    return null;
  },
}));

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
  beforeEach(() => {
    capturedResizablePanelProps = undefined;
  });

  it('restores the collapsed console when its opening drag is cancelled', () => {
    renderWithLogsFeatureFlag(true);
    act(() => {
      jotaiStore.set(isAdvancedModeEnabledState.atom, true);
      jotaiStore.set(logConsoleDisplayModeState.atom, 'collapsed');
    });
    act(() => capturedResizablePanelProps?.onResizeStart?.(100));

    expect(jotaiStore.get(logConsoleDisplayModeState.atom)).toBe('open');

    act(() =>
      capturedResizablePanelProps?.onResizeEnd?.({
        cancelled: true,
        value: 0,
      }),
    );

    expect(jotaiStore.get(logConsoleDisplayModeState.atom)).toBe('collapsed');
  });

  it('keeps an explicitly closed console closed when its drag is cancelled', () => {
    renderWithLogsFeatureFlag(true);
    act(() => {
      jotaiStore.set(isAdvancedModeEnabledState.atom, true);
      jotaiStore.set(logConsoleDisplayModeState.atom, 'collapsed');
    });
    act(() => capturedResizablePanelProps?.onResizeStart?.(100));
    const onResizeEnd = capturedResizablePanelProps?.onResizeEnd;

    expect(jotaiStore.get(logConsoleDisplayModeState.atom)).toBe('open');

    act(() => jotaiStore.set(logConsoleDisplayModeState.atom, 'closed'));
    act(() => onResizeEnd?.({ cancelled: true, value: 0 }));

    expect(jotaiStore.get(logConsoleDisplayModeState.atom)).toBe('closed');
  });

  it('keeps the console open in full screen when its drag is cancelled', () => {
    renderWithLogsFeatureFlag(true);
    act(() => {
      jotaiStore.set(isAdvancedModeEnabledState.atom, true);
      jotaiStore.set(logConsoleDisplayModeState.atom, 'collapsed');
    });
    act(() => capturedResizablePanelProps?.onResizeStart?.(100));
    const onResizeEnd = capturedResizablePanelProps?.onResizeEnd;

    expect(jotaiStore.get(logConsoleDisplayModeState.atom)).toBe('open');

    act(() => jotaiStore.set(isLogConsoleFullScreenState.atom, true));
    act(() => onResizeEnd?.({ cancelled: true, value: 0 }));

    expect(jotaiStore.get(logConsoleDisplayModeState.atom)).toBe('open');
    expect(jotaiStore.get(isLogConsoleFullScreenState.atom)).toBe(true);
  });

  it('restores the collapsed console when the cancel arrives before the drag start renders', () => {
    renderWithLogsFeatureFlag(true);
    act(() => {
      jotaiStore.set(isAdvancedModeEnabledState.atom, true);
      jotaiStore.set(logConsoleDisplayModeState.atom, 'collapsed');
    });
    const onResizeStart = capturedResizablePanelProps?.onResizeStart;
    const onResizeEnd = capturedResizablePanelProps?.onResizeEnd;

    act(() => {
      onResizeStart?.(100);
      onResizeEnd?.({ cancelled: true, value: 0 });
    });

    expect(jotaiStore.get(logConsoleDisplayModeState.atom)).toBe('collapsed');
  });

  it('opens a collapsed console at its saved height on a small keyboard step', () => {
    renderWithLogsFeatureFlag(true);
    act(() => {
      jotaiStore.set(isAdvancedModeEnabledState.atom, true);
      jotaiStore.set(logConsoleHeightState.atom, 450);
      jotaiStore.set(logConsoleDisplayModeState.atom, 'collapsed');
    });

    act(() => capturedResizablePanelProps?.onSizeCommit?.(10));

    expect(jotaiStore.get(logConsoleDisplayModeState.atom)).toBe('open');
    expect(jotaiStore.get(logConsoleHeightState.atom)).toBe(450);
  });

  it('starts the resize range of an open console at its minimum height until a drag begins', () => {
    renderWithLogsFeatureFlag(true);
    act(() => {
      jotaiStore.set(isAdvancedModeEnabledState.atom, true);
      jotaiStore.set(logConsoleDisplayModeState.atom, 'open');
    });

    expect(capturedResizablePanelProps?.min).toBe(
      LOG_CONSOLE_HEIGHT_CONSTRAINTS.min,
    );

    act(() => capturedResizablePanelProps?.onResizeStart?.(300));

    expect(capturedResizablePanelProps?.min).toBe(0);
  });

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
