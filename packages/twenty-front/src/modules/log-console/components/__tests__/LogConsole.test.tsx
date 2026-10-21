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
import { logConsoleActiveSourceIdState } from '@/log-console/states/logConsoleActiveSourceIdState';
import { logConsoleDisplayModeState } from '@/log-console/states/logConsoleDisplayModeState';
import { logConsoleHeightState } from '@/log-console/states/logConsoleHeightState';
import { useSetIsLogConsoleEnabled } from '@/log-console/hooks/useSetIsLogConsoleEnabled';
import { isLogConsoleEnabledState } from '@/log-console/states/isLogConsoleEnabledState';
import { PageFocusId } from '@/types/PageFocusId';
import { focusStackState } from '@/ui/utilities/focus/states/focusStackState';
import { FocusComponentType } from '@/ui/utilities/focus/types/FocusComponentType';
import { type FocusStackItem } from '@/ui/utilities/focus/types/FocusStackItem';
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
let mockShouldReduceMotion = false;

jest.mock('framer-motion', () => ({
  ...jest.requireActual('framer-motion'),
  useReducedMotion: () => mockShouldReduceMotion,
}));

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

const SETTINGS_PAGE_FOCUS_STACK_ITEM: FocusStackItem = {
  focusId: PageFocusId.Settings,
  componentInstance: {
    componentType: FocusComponentType.PAGE,
    componentInstanceId: PageFocusId.Settings,
  },
  globalHotkeysConfig: {
    enableGlobalHotkeysWithModifiers: false,
    enableGlobalHotkeysConflictingWithKeyboard: false,
  },
};

const LogsSwitch = () => {
  const isLogConsoleEnabled = useAtomStateValue(isLogConsoleEnabledState);
  const { setIsLogConsoleEnabled } = useSetIsLogConsoleEnabled();

  return (
    <button
      type="button"
      onClick={() => setIsLogConsoleEnabled(!isLogConsoleEnabled)}
    >
      Logs
    </button>
  );
};

const renderLogConsole = ({ hasSecurityPermission = true } = {}) => {
  resetJotaiStore();
  jotaiStore.set(currentWorkspaceState.atom, mockCurrentWorkspace);
  jotaiStore.set(currentUserWorkspaceState.atom, {
    ...mockedUserData.currentUserWorkspace,
    permissionFlags: hasSecurityPermission ? [PermissionFlagType.SECURITY] : [],
  });
  jotaiStore.set(isClickHouseConfiguredState.atom, true);
  jotaiStore.set(isLogConsoleEnabledState.atom, false);
  jotaiStore.set(logConsoleDisplayModeState.atom, 'collapsed');
  jotaiStore.set(logConsoleActiveSourceIdState.atom, null);

  render(
    <I18nProvider i18n={i18n}>
      <JotaiProvider store={jotaiStore}>
        <ToastProvider>
          <MockedProvider>
            <MemoryRouter>
              <Suspense fallback={null}>
                <LogsSwitch />
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
    mockShouldReduceMotion = false;
  });

  it('restores the collapsed console when its opening drag is cancelled', () => {
    renderLogConsole();
    act(() => {
      jotaiStore.set(isLogConsoleEnabledState.atom, true);
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

  it('opens a console still saved as closed by an earlier version when its bar is dragged', () => {
    const displayModeSavedByEarlierVersion = 'closed' as unknown as 'collapsed';

    renderLogConsole();
    act(() => {
      jotaiStore.set(isLogConsoleEnabledState.atom, true);
      jotaiStore.set(
        logConsoleDisplayModeState.atom,
        displayModeSavedByEarlierVersion,
      );
    });
    act(() => capturedResizeHandleProps?.onResizeStart?.(100));

    expect(jotaiStore.get(logConsoleDisplayModeState.atom)).toBe('open');
  });

  it('keeps the console open in full screen when its drag is cancelled', () => {
    renderLogConsole();
    act(() => {
      jotaiStore.set(isLogConsoleEnabledState.atom, true);
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
      jotaiStore.set(isLogConsoleEnabledState.atom, true);
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
      jotaiStore.set(isLogConsoleEnabledState.atom, true);
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
      jotaiStore.set(isLogConsoleEnabledState.atom, true);
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
      jotaiStore.set(isLogConsoleEnabledState.atom, true);
      jotaiStore.set(logConsoleDisplayModeState.atom, 'open');
    });

    expect(capturedResizeHandleProps?.min).toBe(
      LOG_CONSOLE_HEIGHT_CONSTRAINTS.min,
    );

    act(() => capturedResizeHandleProps?.onResizeStart?.(300));

    expect(capturedResizeHandleProps?.min).toBe(0);
  });

  it('opens when logs is turned on', async () => {
    renderLogConsole();

    expect(screen.queryByText('Log results')).not.toBeInTheDocument();

    await userEvent.click(await screen.findByRole('button', { name: 'Logs' }));

    expect(await screen.findByText('Log results')).toBeInTheDocument();
  });

  it('hides when logs is turned off', async () => {
    mockShouldReduceMotion = true;
    renderLogConsole();

    await userEvent.click(await screen.findByRole('button', { name: 'Logs' }));

    expect(await screen.findByText('Log results')).toBeInTheDocument();

    await userEvent.click(screen.getByRole('button', { name: 'Logs' }));

    expect(
      screen.queryByRole('button', { name: 'Collapse' }),
    ).not.toBeInTheDocument();
  });

  it('has no close button, so logs is the only way to hide it', async () => {
    renderLogConsole();

    await userEvent.click(await screen.findByRole('button', { name: 'Logs' }));

    expect(
      await screen.findByRole('button', { name: 'Collapse' }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole('button', { name: 'Close' }),
    ).not.toBeInTheDocument();
  });

  it('reopens on the last selected log source', () => {
    renderLogConsole();
    act(() => {
      jotaiStore.set(isLogConsoleEnabledState.atom, true);
      jotaiStore.set(logConsoleActiveSourceIdState.atom, 'app-logs');
      jotaiStore.set(logConsoleDisplayModeState.atom, 'open');
    });

    expect(screen.getByRole('tab', { name: 'App logs' })).toHaveAttribute(
      'aria-selected',
      'true',
    );
  });

  it('remembers the log source selected by the user', async () => {
    renderLogConsole();
    act(() => {
      jotaiStore.set(isLogConsoleEnabledState.atom, true);
      jotaiStore.set(logConsoleDisplayModeState.atom, 'open');
    });

    await userEvent.click(screen.getByRole('tab', { name: 'App logs' }));

    expect(jotaiStore.get(logConsoleActiveSourceIdState.atom)).toBe('app-logs');
  });

  it('turns logs on and off with Mod+J on a page that turns off modifier hotkeys', async () => {
    mockShouldReduceMotion = true;
    renderLogConsole();
    act(() => {
      jotaiStore.set(focusStackState.atom, [SETTINGS_PAGE_FOCUS_STACK_ITEM]);
    });

    await userEvent.keyboard('{Control>}j{/Control}');

    expect(jotaiStore.get(isLogConsoleEnabledState.atom)).toBe(true);
    expect(await screen.findByText('Log results')).toBeInTheDocument();

    await userEvent.keyboard('{Meta>}j{/Meta}');

    expect(jotaiStore.get(isLogConsoleEnabledState.atom)).toBe(false);
    expect(screen.queryByText('Log results')).not.toBeInTheDocument();
  });

  it('turns logs off with Mod+J while the console is collapsed', async () => {
    renderLogConsole();
    act(() => {
      jotaiStore.set(isLogConsoleEnabledState.atom, true);
      jotaiStore.set(logConsoleDisplayModeState.atom, 'collapsed');
    });

    await userEvent.keyboard('{Control>}j{/Control}');

    expect(jotaiStore.get(isLogConsoleEnabledState.atom)).toBe(false);
  });

  it('ignores Mod+J when logs are not allowed', async () => {
    renderLogConsole({ hasSecurityPermission: false });

    await userEvent.keyboard('{Control>}j{/Control}');

    expect(jotaiStore.get(isLogConsoleEnabledState.atom)).toBe(false);
  });

  it('ignores Mod+J while a dialog turns off modifier hotkeys', async () => {
    renderLogConsole();
    act(() => {
      jotaiStore.set(focusStackState.atom, [
        SETTINGS_PAGE_FOCUS_STACK_ITEM,
        {
          focusId: 'dialog',
          componentInstance: {
            componentType: FocusComponentType.MODAL,
            componentInstanceId: 'dialog',
          },
          globalHotkeysConfig: {
            enableGlobalHotkeysWithModifiers: false,
            enableGlobalHotkeysConflictingWithKeyboard: false,
          },
        },
      ]);
      jotaiStore.set(logConsoleDisplayModeState.atom, 'collapsed');
    });

    await userEvent.keyboard('{Control>}j{/Control}');

    expect(jotaiStore.get(isLogConsoleEnabledState.atom)).toBe(false);
  });

  it('stays hidden without the security permission', async () => {
    renderLogConsole({ hasSecurityPermission: false });

    await userEvent.click(await screen.findByRole('button', { name: 'Logs' }));

    expect(screen.queryByText('Log results')).not.toBeInTheDocument();
  });
});
