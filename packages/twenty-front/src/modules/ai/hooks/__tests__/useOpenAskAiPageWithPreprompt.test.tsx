import { act, renderHook } from '@testing-library/react';
import { Provider as JotaiProvider } from 'jotai';
import { type ReactNode } from 'react';

import { INBOX_NEW_THREAD_DEFAULT_RECIPIENTS } from '@/ai/constants/InboxNewThreadDefaultRecipients';
import { useOpenAskAiPageWithPreprompt } from '@/ai/hooks/useOpenAskAiPageWithPreprompt';
import { inboxDraftsByThreadIdState } from '@/ai/states/inboxDraftsByThreadIdState';
import { inboxNewThreadRecipientsFamilyState } from '@/ai/states/inboxNewThreadRecipientsFamilyState';
import { agentChatPrepromptState } from '@/ai/states/agentChatPrepromptState';
import { inboxUploadedFilesState } from '@/ai/states/inboxUploadedFilesState';
import { currentInboxThreadState } from '@/ai/states/currentInboxThreadState';
import { newInboxThreadIdState } from '@/ai/states/newInboxThreadIdState';
import { type InboxFileUIPart } from '@/ai/types/InboxFileUIPart';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';

const NEW_CHAT_THREAD_ID = 'new-chat-thread-id';
const OTHER_CHAT_THREAD_ID = 'other-chat-thread-id';

const uploadedFile: InboxFileUIPart = {
  type: 'file',
  filename: 'contacts.csv',
  mediaType: 'text/csv',
  url: 'https://storage.twenty.com/contacts.csv',
  fileId: 'file-id',
};

let finishUpload: () => void = () => {};

jest.mock('@/ai/hooks/useSwitchToNewAiChat', () => ({
  useSwitchToNewAiChat: () => ({
    switchToNewChat: () =>
      jotaiStore.set(currentInboxThreadState.atom, NEW_CHAT_THREAD_ID),
  }),
}));

jest.mock('@/ai/hooks/useInboxFileUpload', () => ({
  useInboxFileUpload: () => ({
    uploadFiles: () =>
      new Promise<InboxFileUIPart[]>((resolve) => {
        finishUpload = () => {
          jotaiStore.set(inboxUploadedFilesState.atom, [uploadedFile]);
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
    jotaiStore.set(inboxDraftsByThreadIdState.atom, {});
    jotaiStore.set(agentChatPrepromptState.atom, null);
    jotaiStore.set(inboxUploadedFilesState.atom, []);
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

    expect(jotaiStore.get(inboxDraftsByThreadIdState.atom)).toEqual({
      [NEW_CHAT_THREAD_ID]: 'Import these contacts',
    });
    expect(jotaiStore.get(agentChatPrepromptState.atom)).toEqual({
      serializedDocument: 'Import these contacts',
      mode: 'SEND',
    });
    expect(jotaiStore.get(inboxUploadedFilesState.atom)).toEqual([
      uploadedFile,
    ]);
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

      jotaiStore.set(currentInboxThreadState.atom, OTHER_CHAT_THREAD_ID);
      finishUpload();
      await opening;
    });

    expect(jotaiStore.get(inboxDraftsByThreadIdState.atom)).toEqual({});
    expect(jotaiStore.get(agentChatPrepromptState.atom)).toBeNull();
    expect(jotaiStore.get(inboxUploadedFilesState.atom)).toEqual([]);
  });

  it('addresses the prompt to the default recipients instead of a leftover draft', async () => {
    const newChatRecipientsAtom =
      inboxNewThreadRecipientsFamilyState.atomFamily(NEW_CHAT_THREAD_ID);

    jotaiStore.set(newInboxThreadIdState.atom, NEW_CHAT_THREAD_ID);
    jotaiStore.set(newChatRecipientsAtom, {
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
      INBOX_NEW_THREAD_DEFAULT_RECIPIENTS,
    );
  });
});
