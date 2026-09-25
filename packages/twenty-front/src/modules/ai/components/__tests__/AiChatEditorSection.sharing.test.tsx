import { setAgentChatThreadPermissions } from '@/ai/testing/setAgentChatThreadPermissions';
import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen } from '@testing-library/react';
import { Provider as JotaiProvider } from 'jotai';
import { type ReactNode } from 'react';

import { AiChatEditorSection } from '@/ai/components/AiChatEditorSection';
import { currentAiChatThreadState } from '@/ai/states/currentAiChatThreadState';
import {
  jotaiStore,
  resetJotaiStore,
} from '@/ui/utilities/state/jotai/jotaiStore';

const useAiChatEditor = jest.fn();
jest.mock('@/ai/hooks/useAiChatEditor', () => ({
  useAiChatEditor: () => useAiChatEditor(),
}));
jest.mock('@/ai/components/AiChatStandaloneError', () => ({
  AiChatStandaloneError: () => null,
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
    jotaiStore.set(currentAiChatThreadState.atom, 'shared-thread');
  });

  it.each([false, undefined])(
    'keeps the composer read-only without update permission (%s)',
    (canUpdate) => {
      setAgentChatThreadPermissions(
        jotaiStore,
        'shared-thread',
        canUpdate === undefined
          ? undefined
          : {
              canRead: true,
              canUpdate,
              canDelete: false,
              canSoftDelete: false,
            },
      );
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
    setAgentChatThreadPermissions(jotaiStore, 'shared-thread', {
      canRead: false,
      canUpdate: false,
      canDelete: false,
      canSoftDelete: false,
    });
    render(<AiChatEditorSection />, { wrapper: Wrapper });
    expect(screen.getByRole('status')).toHaveTextContent(
      'This conversation is no longer available.',
    );
    expect(screen.queryByText('Loading conversation…')).toBeNull();
    expect(useAiChatEditor).not.toHaveBeenCalled();
  });
});
