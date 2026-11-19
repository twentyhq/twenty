import { AiChatTestInstance } from '@/ai-chat/testing/AiChatTestInstance';
import { setAiChatThreadPermissions } from '@/ai-chat/threads/testing/setAiChatThreadPermissions';
import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen } from '@testing-library/react';
import { Provider as JotaiProvider } from 'jotai';
import { type ReactNode } from 'react';

import { AiChatEditorSection } from '@/ai-chat/composer/components/AiChatEditorSection';
import {
  jotaiStore,
  resetJotaiStore,
} from '@/ui/utilities/state/jotai/jotaiStore';

const useAiChatEditor = jest.fn();
jest.mock('@/ai-chat/composer/hooks/useAiChatEditor', () => ({
  useAiChatEditor: () => useAiChatEditor(),
}));
jest.mock('@/ai-chat/composer/components/AiChatStandaloneError', () => ({
  AiChatStandaloneError: () => null,
}));
// The gate's cards pull in a rich text editor Jest cannot load.
jest.mock('@/ai-chat/tool-calls/components/AiChatPendingAskGate', () => ({
  AiChatPendingAskGate: ({ children }: { children: ReactNode }) => children,
}));
const Wrapper = ({ children }: { children: ReactNode }) => (
  <JotaiProvider store={jotaiStore}>
    <I18nProvider i18n={i18n}>
      <AiChatTestInstance threadId="shared-thread">
        {children}
      </AiChatTestInstance>
    </I18nProvider>
  </JotaiProvider>
);

describe('Shared conversation composer', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetJotaiStore();
  });

  it.each([false, undefined])(
    'keeps the composer read-only without update permission (%s)',
    (canUpdate) => {
      setAiChatThreadPermissions({
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
      render(<AiChatEditorSection />, { wrapper: Wrapper });
      expect(screen.getByRole('status')).toHaveTextContent(
        canUpdate === undefined
          ? 'Loading conversation'
          : 'You can read this conversation',
      );
      expect(screen.queryByRole('textbox')).toBeNull();
      expect(useAiChatEditor).not.toHaveBeenCalled();
    },
  );
  it('shows unavailable rather than loading after access is revoked in either chat surface', () => {
    setAiChatThreadPermissions({
      store: jotaiStore,
      threadId: 'shared-thread',
      permissions: {
        canRead: false,
        canUpdate: false,
        canDelete: false,
        canSoftDelete: false,
      },
    });
    render(<AiChatEditorSection />, { wrapper: Wrapper });
    expect(screen.getByRole('status')).toHaveTextContent(
      'This conversation is no longer available.',
    );
    expect(screen.queryByText('Loading conversation…')).toBeNull();
    expect(useAiChatEditor).not.toHaveBeenCalled();
  });
});
