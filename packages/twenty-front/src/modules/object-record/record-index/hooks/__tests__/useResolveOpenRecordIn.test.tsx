import { renderHook } from '@testing-library/react';
import { Provider as JotaiProvider } from 'jotai';
import { act } from 'react';

import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { ContextStoreComponentInstanceContext } from '@/context-store/states/contexts/ContextStoreComponentInstanceContext';
import { contextStoreCurrentViewIdComponentState } from '@/context-store/states/contextStoreCurrentViewIdComponentState';
import { useResolveOpenRecordIn } from '@/object-record/record-index/hooks/useResolveOpenRecordIn';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { ViewOpenRecordIn } from '~/generated-metadata/graphql';

jest.mock('react-responsive', () => ({
  useMediaQuery: jest.fn().mockReturnValue(false),
}));

jest.mock(
  '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue',
  () => ({
    useAtomFamilySelectorValue: jest.fn(),
  }),
);

const mockUseAtomFamilySelectorValue = jest.requireMock(
  '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue',
).useAtomFamilySelectorValue as jest.Mock;

// Stands in for the views store: only the view the hook actually asks for
// comes back, so a hook reading the wrong view id resolves to nothing.
const VIEW_OPEN_RECORD_IN_BY_VIEW_ID: Record<string, ViewOpenRecordIn> = {
  'record-page-view-id': ViewOpenRecordIn.RECORD_PAGE,
  'user-preference-view-id': ViewOpenRecordIn.USER_PREFERENCE,
};

mockUseAtomFamilySelectorValue.mockImplementation(
  (_selector: unknown, { viewId }: { viewId: string }) => {
    const openRecordIn = VIEW_OPEN_RECORD_IN_BY_VIEW_ID[viewId];

    return openRecordIn ? { id: viewId, openRecordIn } : undefined;
  },
);

const setCurrentView = (viewId: string) =>
  act(() => {
    jotaiStore.set(
      contextStoreCurrentViewIdComponentState.atomFamily({
        instanceId: 'test-context-store',
      }),
      viewId,
    );
  });

const setOpenRecordInPreference = (openRecordIn: ViewOpenRecordIn) =>
  act(() => {
    jotaiStore.set(currentWorkspaceMemberState.atom, {
      id: 'test-workspace-member-id',
      openRecordIn,
    } as never);
  });

const WrapperWithoutContextStore = ({
  children,
}: {
  children: React.ReactNode;
}) => <JotaiProvider store={jotaiStore}>{children}</JotaiProvider>;

const WrapperWithContextStore = ({
  children,
}: {
  children: React.ReactNode;
}) => (
  <JotaiProvider store={jotaiStore}>
    <ContextStoreComponentInstanceContext.Provider
      value={{ instanceId: 'test-context-store' }}
    >
      {children}
    </ContextStoreComponentInstanceContext.Provider>
  </JotaiProvider>
);

describe('useResolveOpenRecordIn', () => {
  afterEach(() => {
    act(() => {
      jotaiStore.set(
        contextStoreCurrentViewIdComponentState.atomFamily({
          instanceId: 'test-context-store',
        }),
        undefined,
      );
      jotaiStore.set(currentWorkspaceMemberState.atom, null);
    });
  });

  it('falls back to the default where no context store is mounted', () => {
    const { result } = renderHook(() => useResolveOpenRecordIn('company'), {
      wrapper: WrapperWithoutContextStore,
    });

    expect(result.current).toBe(ViewOpenRecordIn.SIDE_PANEL);
  });

  it('follows the current view of the surrounding context store', () => {
    setCurrentView('record-page-view-id');

    const { result } = renderHook(() => useResolveOpenRecordIn('company'), {
      wrapper: WrapperWithContextStore,
    });

    expect(result.current).toBe(ViewOpenRecordIn.RECORD_PAGE);
  });

  it('follows the member preference when the view defers to it', () => {
    setCurrentView('user-preference-view-id');
    setOpenRecordInPreference(ViewOpenRecordIn.RECORD_PAGE);

    const { result } = renderHook(() => useResolveOpenRecordIn('company'), {
      wrapper: WrapperWithContextStore,
    });

    expect(result.current).toBe(ViewOpenRecordIn.RECORD_PAGE);
  });

  it('follows a side panel preference when the view defers to it', () => {
    setCurrentView('user-preference-view-id');
    setOpenRecordInPreference(ViewOpenRecordIn.SIDE_PANEL);

    const { result } = renderHook(() => useResolveOpenRecordIn('company'), {
      wrapper: WrapperWithContextStore,
    });

    expect(result.current).toBe(ViewOpenRecordIn.SIDE_PANEL);
  });
});
