import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { MockedProvider } from '@apollo/client/testing/react';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider as JotaiProvider } from 'jotai';
import { Suspense } from 'react';
import { MemoryRouter } from 'react-router-dom';
import { ToastProvider } from 'twenty-ui/components/feedback';
import { type ResizeHandleProps } from 'twenty-ui/primitives/layout';

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
import { PermissionFlagType } from '~/generated-metadata/graphql';
import {
  mockCurrentWorkspace,
  mockedUserData,
} from '~/testing/mock-data/users';

let capturedResizeHandleProps: ResizeHandleProps | undefined;

jest.mock('twenty-ui/primitives/layout', () => ({
  ...jest.requireActual('twenty-ui/primitives/layout'),
  ResizeHandle: (props: ResizeHandleProps) => {
    capturedResizeHandleProps = props;
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

const renderLogConsole = (
  permissionFlags: PermissionFlagType[] = [PermissionFlagType.SECURITY],
) => {
  resetJotaiStore();
  jotaiStore.set(currentWorkspaceState.atom, mockCurrentWorkspace);
  jotaiStore.set(currentUserWorkspaceState.atom, {
    ...mockedUserData.currentUserWorkspace,
    permissionFlags,
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
    capturedResizeHandleProps = undefined;
  });

  it('restores the collapsed console when its opening drag is cancelled', () => {
    renderLogConsole();
    act(() => {
      jotaiStore.set(isAdvancedModeEnabledState.atom, true);
      jotaiStore.set(logConsoleDisplayModeState.atom, 'collapsed');
    });
    act(() => capturedResizeHandleProps?.onResizeStart?.(100));

    expect(jotaiStore.get(logConsoleDisplayModeState.atom)).toBe('open');

    act(() =>
      capturedResizeHandleProps?.onResizeEnd?.({
        cancelled: true,
        value: 0,
      }),
    );

    expect(jotaiStore.get(logConsoleDisplayModeState.atom)).toBe('collapsed');
  });

  it('keeps an explicitly closed console closed when its drag is cancelled', () => {
    renderLogConsole();
    act(() => {
      jotaiStore.set(isAdvancedModeEnabledState.atom, true);
      jotaiStore.set(logConsoleDisplayModeState.atom, 'collapsed');
    });
    act(() => capturedResizeHandleProps?.onResizeStart?.(100));
    const onResizeEnd = capturedResizeHandleProps?.onResizeEnd;

    expect(jotaiStore.get(logConsoleDisplayModeState.atom)).toBe('open');

    act(() => jotaiStore.set(logConsoleDisplayModeState.atom, 'closed'));
    act(() => onResizeEnd?.({ cancelled: true, value: 0 }));

    expect(jotaiStore.get(logConsoleDisplayModeState.atom)).toBe('closed');
  });

  it('keeps the console open in full screen when its drag is cancelled', () => {
    renderLogConsole();
    act(() => {
      jotaiStore.set(isAdvancedModeEnabledState.atom, true);
      jotaiStore.set(logConsoleDisplayModeState.atom, 'collapsed');
    });
    act(() => capturedResizeHandleProps?.onResizeStart?.(100));
    const onResizeEnd = capturedResizeHandleProps?.onResizeEnd;

    expect(jotaiStore.get(logConsoleDisplayModeState.atom)).toBe('open');

    act(() => jotaiStore.set(isLogConsoleFullScreenState.atom, true));
    act(() => onResizeEnd?.({ cancelled: true, value: 0 }));

    expect(jotaiStore.get(logConsoleDisplayModeState.atom)).toBe('open');
    expect(jotaiStore.get(isLogConsoleFullScreenState.atom)).toBe(true);
  });

  it('restores the collapsed console when the cancel arrives before the drag start renders', () => {
    renderLogConsole();
    act(() => {
      jotaiStore.set(isAdvancedModeEnabledState.atom, true);
      jotaiStore.set(logConsoleDisplayModeState.atom, 'collapsed');
    });
    const onResizeStart = capturedResizeHandleProps?.onResizeStart;
    const onResizeEnd = capturedResizeHandleProps?.onResizeEnd;

    act(() => {
      onResizeStart?.(100);
      onResizeEnd?.({ cancelled: true, value: 0 });
    });

    expect(jotaiStore.get(logConsoleDisplayModeState.atom)).toBe('collapsed');
  });

  it('opens a collapsed console at its saved height on a small keyboard step', () => {
    renderLogConsole();
    act(() => {
      jotaiStore.set(isAdvancedModeEnabledState.atom, true);
      jotaiStore.set(logConsoleHeightState.atom, 450);
      jotaiStore.set(logConsoleDisplayModeState.atom, 'collapsed');
    });

    act(() => capturedResizeHandleProps?.onValueCommitted?.(10));

    expect(jotaiStore.get(logConsoleDisplayModeState.atom)).toBe('open');
    expect(jotaiStore.get(logConsoleHeightState.atom)).toBe(450);
  });

  it('reflects live resizing without saving the console height until commit', () => {
    renderLogConsole();
    act(() => {
      jotaiStore.set(isAdvancedModeEnabledState.atom, true);
      jotaiStore.set(logConsoleHeightState.atom, 450);
      jotaiStore.set(logConsoleDisplayModeState.atom, 'open');
    });

    act(() => capturedResizeHandleProps?.onValueChange?.(300));

    expect(capturedResizeHandleProps?.value).toBe(300);
    expect(jotaiStore.get(logConsoleHeightState.atom)).toBe(450);

    act(() => capturedResizeHandleProps?.onValueCommitted?.(300));

    expect(capturedResizeHandleProps?.value).toBe(300);
    expect(jotaiStore.get(logConsoleHeightState.atom)).toBe(300);
  });

  it('starts the resize range of an open console at its minimum height until a drag begins', () => {
    renderLogConsole();
    act(() => {
      jotaiStore.set(isAdvancedModeEnabledState.atom, true);
      jotaiStore.set(logConsoleDisplayModeState.atom, 'open');
    });

    expect(capturedResizeHandleProps?.min).toBe(
      LOG_CONSOLE_HEIGHT_CONSTRAINTS.min,
    );

    act(() => capturedResizeHandleProps?.onResizeStart?.(300));

    expect(capturedResizeHandleProps?.min).toBe(0);
  });

  it('opens when developer mode is turned on', async () => {
    renderLogConsole();

    expect(screen.queryByText('Log results')).not.toBeInTheDocument();

    await userEvent.click(
      await screen.findByRole('button', { name: 'Developer mode' }),
    );

    expect(await screen.findByText('Log results')).toBeInTheDocument();
  });

  it('stays open when developer mode is turned off', async () => {
    renderLogConsole();

    await userEvent.click(
      await screen.findByRole('button', { name: 'Developer mode' }),
    );

    expect(await screen.findByText('Log results')).toBeInTheDocument();

    await userEvent.click(
      screen.getByRole('button', { name: 'Developer mode' }),
    );

    expect(screen.getByText('Log results')).toBeInTheDocument();
  });

  it('only shows the CLI tab without security or API permissions', async () => {
    renderLogConsole([]);
    act(() => jotaiStore.set(logConsoleDisplayModeState.atom, 'open'));

    expect(await screen.findByRole('tab', { name: 'CLI' })).toBeInTheDocument();
    expect(screen.queryByRole('tab', { name: 'Logs' })).not.toBeInTheDocument();
    expect(screen.queryByRole('tab', { name: 'APIs' })).not.toBeInTheDocument();
    expect(screen.queryByText('Log results')).not.toBeInTheDocument();
  });

  it('shows the APIs and Webhooks tabs with the API keys permission', async () => {
    renderLogConsole([PermissionFlagType.API_KEYS_AND_WEBHOOKS]);
    act(() => jotaiStore.set(logConsoleDisplayModeState.atom, 'open'));

    expect(
      await screen.findByRole('tab', { name: 'APIs' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: 'Webhooks' })).toBeInTheDocument();
    expect(screen.queryByRole('tab', { name: 'Logs' })).not.toBeInTheDocument();
  });
});
