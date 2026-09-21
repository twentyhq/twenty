import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { render, screen } from '@testing-library/react';
import { Provider as JotaiProvider } from 'jotai';
import { type ReactNode } from 'react';

import { AiChatEditorSection } from '@/ai/components/AiChatEditorSection';
import { currentAiChatThreadState } from '@/ai/states/currentAiChatThreadState';
import { metadataStoreState } from '@/metadata-store/states/metadataStoreState';
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
    'never mounts an editable composer for a viewer or unknown access (%s)',
    (canManage) => {
      const threads =
        canManage === undefined ? [] : [{ id: 'shared-thread', canManage }];
      jotaiStore.set(metadataStoreState.atomFamily('agentChatThreads'), {
        current: threads,
        draft: threads,
        status: 'up-to-date',
      });
      render(<AiChatEditorSection />, { wrapper: Wrapper });
      expect(screen.getByRole('status')).toHaveTextContent(
        'only the owner can send messages',
      );
      expect(screen.queryByRole('textbox')).toBeNull();
      expect(useAiChatEditor).not.toHaveBeenCalled();
    },
  );
});
