import { type createStore } from 'jotai';
import { isDefined } from 'twenty-shared/utils';

import { AI_CHAT_RESTORE_EDITOR_CONTENT_EVENT_NAME } from '@/ai-chat/composer/constants/AiChatRestoreEditorContentEventName';
import { aiChatComposerAttachmentsFamilyState } from '@/ai-chat/composer/states/aiChatComposerAttachmentsFamilyState';
import { type AiChatRestoreEditorContentEventDetail } from '@/ai-chat/composer/types/AiChatRestoreEditorContentEventDetail';
import { aiChatComposerDraftsState } from '@/ai-chat/states/composer/aiChatComposerDraftsState';
import { aiChatComposerQuotedMessageIdFamilyState } from '@/ai-chat/states/composer/aiChatComposerQuotedMessageIdFamilyState';
import { type AiChatFileUIPart } from '@/ai-chat/types/AiChatFileUIPart';
import { dispatchBrowserEvent } from '@/browser-event/utils/dispatchBrowserEvent';

export const restoreAiChatComposerAfterFailedSend = ({
  store,
  threadId,
  serializedContent,
  attachments,
  quotedMessageId,
}: {
  store: ReturnType<typeof createStore>;
  threadId: string;
  serializedContent: string;
  attachments: AiChatFileUIPart[];
  quotedMessageId: string | null;
}) => {
  store.set(aiChatComposerDraftsState.atom, (aiChatComposerDrafts) => ({
    ...aiChatComposerDrafts,
    [threadId]: serializedContent,
  }));
  store.set(
    aiChatComposerAttachmentsFamilyState.atomFamily({ threadId }),
    (aiChatComposerAttachments) => [
      ...attachments,
      ...aiChatComposerAttachments,
    ],
  );

  const quotedMessageIdAtom =
    aiChatComposerQuotedMessageIdFamilyState.atomFamily({ threadId });

  if (!isDefined(store.get(quotedMessageIdAtom))) {
    store.set(quotedMessageIdAtom, quotedMessageId);
  }

  dispatchBrowserEvent<AiChatRestoreEditorContentEventDetail>(
    AI_CHAT_RESTORE_EDITOR_CONTENT_EVENT_NAME,
    { threadId, content: serializedContent },
  );
};
