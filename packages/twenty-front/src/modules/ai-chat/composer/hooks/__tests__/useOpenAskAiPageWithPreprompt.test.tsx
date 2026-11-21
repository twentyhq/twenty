import { act, renderHook } from '@testing-library/react';
import { Provider as JotaiProvider } from 'jotai';
import { type ReactNode } from 'react';

import { AI_CHAT_NEW_THREAD_DEFAULT_RECIPIENTS } from '@/ai-chat/constants/AiChatNewThreadDefaultRecipients';
import { useOpenAskAiPageWithPreprompt } from '@/ai-chat/composer/hooks/useOpenAskAiPageWithPreprompt';
import { aiChatComposerDraftsState } from '@/ai-chat/states/composer/aiChatComposerDraftsState';
import { aiChatRequiredThreadListenersState } from '@/ai-chat/states/aiChatRequiredThreadListenersState';
import { aiChatComposerNewThreadRecipientsFamilyState } from '@/ai-chat/states/composer/aiChatComposerNewThreadRecipientsFamilyState';
import { aiChatComposerAttachmentsFamilyState } from '@/ai-chat/states/composer/aiChatComposerAttachmentsFamilyState';
import { newAiChatThreadIdState } from '@/ai-chat/states/newAiChatThreadIdState';
import { type AiChatFileUIPart } from '@/ai-chat/types/AiChatFileUIPart';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';

const NEW_CHAT_THREAD_ID = 'new-chat-thread-id';
const OTHER_CHAT_THREAD_ID = 'other-chat-thread-id';

const uploadedFile: AiChatFileUIPart = {
  type: 'file',
  filename: 'contacts.csv',
  mediaType: 'text/csv',
  url: 'https://storage.twenty.com/contacts.csv',
  fileId: 'file-id',
};

let finishUpload: () => void = () => {};
const sendAiChatMessage = jest.fn();

jest.mock('@/ai-chat/composer/hooks/useSendAiChatMessage', () => ({
  useSendAiChatMessage: () => ({ sendAiChatMessage }),
}));

jest.mock('@/ai-chat/hooks/useSelectAiChatThreadFromNewChat', () => ({
  useSelectAiChatThreadFromNewChat: () => ({
    selectAiChatThreadFromNewChat: jest.fn(),
  }),
}));

jest.mock('@/ai-chat/composer/hooks/useSwitchToNewAiChat', () => ({
  useSwitchToNewAiChat: () => ({
    switchToNewChat: () => {
      jotaiStore.set(aiChatRequiredThreadListenersState.atom, {
        'side-panel': NEW_CHAT_THREAD_ID,
      });

      return NEW_CHAT_THREAD_ID;
    },
  }),
}));

jest.mock('@/ai-chat/composer/hooks/useAiChatFileUpload', () => ({
  useAiChatFileUpload: () => ({
    uploadFiles: () =>
      new Promise<AiChatFileUIPart[]>((resolve) => {
        finishUpload = () => {
          jotaiStore.set(
            aiChatComposerAttachmentsFamilyState.atomFamily({
              threadId: NEW_CHAT_THREAD_ID,
            }),
            [uploadedFile],
          );
          resolve([uploadedFile]);
        };
      }),
  }),
}));

jest.mock('@/ai/hooks/useWorkspaceAiModelTiers', () => ({
  useWorkspaceAiModelTiers: () => ({ chatTier: 'smart' }),
}));

const Wrapper = ({ children }: { children: ReactNode }) => (
  <JotaiProvider store={jotaiStore}>{children}</JotaiProvider>
);

describe('useOpenAskAiPageWithPreprompt', () => {
  beforeEach(() => {
    sendAiChatMessage.mockClear();
    jotaiStore.set(aiChatComposerDraftsState.atom, {});
    jotaiStore.set(
      aiChatComposerAttachmentsFamilyState.atomFamily({
        threadId: NEW_CHAT_THREAD_ID,
      }),
      [],
    );
  });

  it('sends the prompt in the new chat once the files have uploaded', async () => {
    const { result } = renderHook(() => useOpenAskAiPageWithPreprompt(), {
      wrapper: Wrapper,
    });

    await act(async () => {
      const opening = result.current.openAskAiPageWithPreprompt({
        serializedDocument: 'Import these contacts',
        mode: 'SEND',
        files: [new File(['name'], 'contacts.csv')],
      });

      finishUpload();
      await opening;
    });

    expect(jotaiStore.get(aiChatComposerDraftsState.atom)).toEqual({
      [NEW_CHAT_THREAD_ID]: 'Import these contacts',
    });
    expect(sendAiChatMessage).toHaveBeenCalledWith(
      expect.objectContaining({ threadId: NEW_CHAT_THREAD_ID }),
    );
    expect(
      jotaiStore.get(
        aiChatComposerAttachmentsFamilyState.atomFamily({
          threadId: NEW_CHAT_THREAD_ID,
        }),
      ),
    ).toEqual([uploadedFile]);
  });

  it('drops the prompt and its files when the user switches chats during the upload', async () => {
    const { result } = renderHook(() => useOpenAskAiPageWithPreprompt(), {
      wrapper: Wrapper,
    });

    await act(async () => {
      const opening = result.current.openAskAiPageWithPreprompt({
        serializedDocument: 'Import these contacts',
        mode: 'SEND',
        files: [new File(['name'], 'contacts.csv')],
      });

      jotaiStore.set(aiChatRequiredThreadListenersState.atom, {
        'side-panel': OTHER_CHAT_THREAD_ID,
      });
      finishUpload();
      await opening;
    });

    expect(jotaiStore.get(aiChatComposerDraftsState.atom)).toEqual({});
    expect(sendAiChatMessage).not.toHaveBeenCalled();
    expect(
      jotaiStore.get(
        aiChatComposerAttachmentsFamilyState.atomFamily({
          threadId: NEW_CHAT_THREAD_ID,
        }),
      ),
    ).toEqual([]);
  });

  it('addresses the prompt to the default recipients instead of a leftover draft', async () => {
    const newChatRecipientsAtom =
      aiChatComposerNewThreadRecipientsFamilyState.atomFamily(
        NEW_CHAT_THREAD_ID,
      );

    jotaiStore.set(newAiChatThreadIdState.atom, NEW_CHAT_THREAD_ID);
    jotaiStore.set(newChatRecipientsAtom, {
      channelId: null,
      isAssistantParticipant: false,
      recipientWorkspaceMemberIds: ['20202020-0000-4000-8000-0000000000bb'],
    });

    const { result } = renderHook(() => useOpenAskAiPageWithPreprompt(), {
      wrapper: Wrapper,
    });

    await act(async () => {
      await result.current.openAskAiPageWithPreprompt({
        serializedDocument: 'Summarize my open deals',
        mode: 'SEND',
      });
    });

    expect(jotaiStore.get(newChatRecipientsAtom)).toEqual(
      AI_CHAT_NEW_THREAD_DEFAULT_RECIPIENTS,
    );
  });
});
