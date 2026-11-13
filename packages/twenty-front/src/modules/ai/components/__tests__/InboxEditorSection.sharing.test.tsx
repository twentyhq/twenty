import { setInboxThreadPermissions } from '@/ai/testing/setInboxThreadPermissions';
import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen } from '@testing-library/react';
import { Provider as JotaiProvider } from 'jotai';
import { type ReactNode } from 'react';

import { InboxEditorSection } from '@/ai/components/InboxEditorSection';
import { currentInboxThreadState } from '@/ai/states/currentInboxThreadState';
import {
  jotaiStore,
  resetJotaiStore,
} from '@/ui/utilities/state/jotai/jotaiStore';

const useInboxEditor = jest.fn();
jest.mock('@/ai/hooks/useInboxEditor', () => ({
  useInboxEditor: () => useInboxEditor(),
}));
jest.mock('@/ai/components/InboxStandaloneError', () => ({
  InboxStandaloneError: () => null,
}));
// The gate's cards pull in a rich text editor Jest cannot load.
jest.mock('@/ai/components/AiChatPendingAskGate', () => ({
  AiChatPendingAskGate: ({ children }: { children: ReactNode }) => children,
}));
const Wrapper = ({ children }: { children: ReactNode }) => (
  <JotaiProvider store={jotaiStore}>
    <I18nProvider i18n={i18n}>{children}</I18nProvider>
  </JotaiProvider>
);

describe('Shared conversation composer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetJotaiStore();
    jotaiStore.set(currentInboxThreadState.atom, 'shared-thread');
  });

  it.each([false, undefined])(
    'keeps the composer read-only without update permission (%s)',
    (canUpdate) => {
      setInboxThreadPermissions({
        store: jotaiStore,
        threadId: 'shared-thread',
        permissions:
          canUpdate === undefined
            ? undefined
            : {
                canRead: true,
                canUpdate,
                canDelete: false,
                canSoftDelete: false,
              },
      });
      render(<InboxEditorSection />, { wrapper: Wrapper });
      expect(screen.getByRole('status')).toHaveTextContent(
        canUpdate === undefined
          ? 'Loading conversation'
          : 'You can read this conversation',
      );
      expect(screen.queryByRole('textbox')).toBeNull();
      expect(useInboxEditor).not.toHaveBeenCalled();
    },
  );
  it('shows unavailable rather than loading after access is revoked in either chat surface', () => {
    setInboxThreadPermissions({
      store: jotaiStore,
      threadId: 'shared-thread',
      permissions: {
        canRead: false,
        canUpdate: false,
        canDelete: false,
        canSoftDelete: false,
      },
    });
    render(<InboxEditorSection />, { wrapper: Wrapper });
    expect(screen.getByRole('status')).toHaveTextContent(
      'This conversation is no longer available.',
    );
    expect(screen.queryByText('Loading conversation…')).toBeNull();
    expect(useInboxEditor).not.toHaveBeenCalled();
  });
});
