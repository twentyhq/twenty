import { useOpenComposeEmailInSidePanel } from '@/side-panel/hooks/useOpenComposeEmailInSidePanel';
import { composeEmailInitialFromHandleComponentState } from '@/side-panel/pages/compose-email/states/composeEmailInitialFromHandleComponentState';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { act, renderHook } from '@testing-library/react';
import { Provider as JotaiProvider } from 'jotai';
import { type ReactNode } from 'react';

const mockNavigateSidePanelMenu = jest.fn();

jest.mock('@/side-panel/hooks/useSidePanelMenu', () => ({
  useSidePanelMenu: () => ({
    navigateSidePanelMenu: mockNavigateSidePanelMenu,
  }),
}));

describe('useOpenComposeEmailInSidePanel', () => {
  it('stores the initial From handle for the composer', () => {
    const { result } = renderHook(() => useOpenComposeEmailInSidePanel(), {
      wrapper: ({ children }: { children: ReactNode }) => (
        <JotaiProvider store={jotaiStore}>{children}</JotaiProvider>
      ),
    });

    act(() => {
      result.current.openComposeEmailInSidePanel({
        connectedAccountId: 'account-id',
        initialFromHandle: 'ops@example.com',
      });
    });

    const { pageId } = mockNavigateSidePanelMenu.mock.calls[0][0];

    expect(
      jotaiStore.get(
        composeEmailInitialFromHandleComponentState.atomFamily({
          instanceId: pageId,
        }),
      ),
    ).toBe('ops@example.com');
  });
});
