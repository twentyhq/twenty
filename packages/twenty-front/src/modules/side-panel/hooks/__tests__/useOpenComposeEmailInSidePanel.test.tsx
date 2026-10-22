import { useOpenComposeEmailInSidePanel } from '@/side-panel/hooks/useOpenComposeEmailInSidePanel';
import { composeEmailIsReplyComponentState } from '@/side-panel/pages/compose-email/states/composeEmailIsReplyComponentState';
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

const wrapper = ({ children }: { children: ReactNode }) => (
  <JotaiProvider store={jotaiStore}>{children}</JotaiProvider>
);

const open = (isReply?: boolean) => {
  const { result } = renderHook(() => useOpenComposeEmailInSidePanel(), {
    wrapper,
  });

  act(() => {
    result.current.openComposeEmailInSidePanel({
      connectedAccountId: 'account-id',
      defaultInReplyTo: '',
      isReply,
    });
  });

  const { pageId } = mockNavigateSidePanelMenu.mock.calls.at(-1)?.[0] ?? {};

  return jotaiStore.get(
    composeEmailIsReplyComponentState.atomFamily({ instanceId: pageId }),
  );
};

describe('useOpenComposeEmailInSidePanel', () => {
  beforeEach(() => {
    mockNavigateSidePanelMenu.mockReset();
  });

  it('flags a reply even when it has no message id', () => {
    expect(open(true)).toBe(true);
  });

  it('does not flag a new email as a reply', () => {
    expect(open()).toBe(false);
  });
});
