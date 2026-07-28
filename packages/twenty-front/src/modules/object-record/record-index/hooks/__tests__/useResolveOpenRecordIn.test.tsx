import { renderHook } from '@testing-library/react';
import { Provider as JotaiProvider } from 'jotai';

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
mockUseAtomFamilySelectorValue.mockImplementation(
  (_selector: unknown, { viewId }: { viewId: string }) =>
    viewId === 'test-view-id'
      ? { id: viewId, openRecordIn: ViewOpenRecordIn.RECORD_PAGE }
      : undefined,
);

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
  it('falls back to the default where no context store is mounted', () => {
    const { result } = renderHook(() => useResolveOpenRecordIn('company'), {
      wrapper: WrapperWithoutContextStore,
    });

    expect(result.current).toBe(ViewOpenRecordIn.SIDE_PANEL);
  });

  it('follows the current view of the surrounding context store', () => {
    jotaiStore.set(
      contextStoreCurrentViewIdComponentState.atomFamily({
        instanceId: 'test-context-store',
      }),
      'test-view-id',
    );

    const { result } = renderHook(() => useResolveOpenRecordIn('company'), {
      wrapper: WrapperWithContextStore,
    });

    expect(result.current).toBe(ViewOpenRecordIn.RECORD_PAGE);
  });
});
