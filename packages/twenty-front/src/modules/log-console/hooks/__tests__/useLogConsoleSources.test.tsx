import { act, renderHook } from '@testing-library/react';
import { Provider as JotaiProvider } from 'jotai';
import { type ReactNode } from 'react';

import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { useLogConsoleSources } from '@/log-console/hooks/useLogConsoleSources';
import { logConsoleActiveSourceIdState } from '@/log-console/states/logConsoleActiveSourceIdState';
import {
  jotaiStore,
  resetJotaiStore,
} from '@/ui/utilities/state/jotai/jotaiStore';
import { mockCurrentWorkspace } from '~/testing/mock-data/users';

const Wrapper = ({ children }: { children: ReactNode }) => (
  <JotaiProvider store={jotaiStore}>{children}</JotaiProvider>
);

describe('useLogConsoleSources', () => {
  beforeEach(() => {
    resetJotaiStore();
    jotaiStore.set(currentWorkspaceState.atom, mockCurrentWorkspace);
  });

  it('starts on app logs when no log source was saved', () => {
    jotaiStore.set(logConsoleActiveSourceIdState.atom, null);

    const { result } = renderHook(useLogConsoleSources, { wrapper: Wrapper });

    expect(result.current.activeSource.id).toBe('app-logs');
  });

  it('reopens on the saved log source', () => {
    jotaiStore.set(logConsoleActiveSourceIdState.atom, 'record-changes');

    const { result } = renderHook(useLogConsoleSources, { wrapper: Wrapper });

    expect(result.current.activeSource.id).toBe('record-changes');
  });

  it('saves the log source selected by the user', () => {
    const { result } = renderHook(useLogConsoleSources, { wrapper: Wrapper });

    act(() => result.current.changeSource('record-changes'));

    expect(jotaiStore.get(logConsoleActiveSourceIdState.atom)).toBe(
      'record-changes',
    );
  });
});
