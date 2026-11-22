import { useApolloClient } from '@apollo/client/react';
import { t } from '@lingui/core/macro';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { isDefined, tipTapDocumentToMarkdown } from 'twenty-shared/utils';
import { useToast } from 'twenty-ui/components/feedback';

import { AI_CHAT_RESTORE_EDITOR_CONTENT_EVENT_NAME } from '@/ai-chat/composer/constants/AiChatRestoreEditorContentEventName';
import { useOpenNewAiChatAsDirectMessage } from '@/ai-chat/composer/hooks/useOpenNewAiChatAsDirectMessage';
import { useSendAiChatMessageToThread } from '@/ai-chat/composer/hooks/useSendAiChatMessageToThread';
import { aiChatComposerNewThreadRecipientsFamilyState } from '@/ai-chat/composer/states/aiChatComposerNewThreadRecipientsFamilyState';
import { aiChatComposerUploadingFilesFamilyState } from '@/ai-chat/composer/states/aiChatComposerUploadingFilesFamilyState';
import { type AiChatRestoreEditorContentEventDetail } from '@/ai-chat/composer/types/AiChatRestoreEditorContentEventDetail';
import { type AiChatSendTarget } from '@/ai-chat/composer/types/AiChatSendTarget';
import { getAiChatMessageContentToSend } from '@/ai-chat/composer/utils/getAiChatMessageContentToSend';
import { getAiChatMessageRecipientsToSend } from '@/ai-chat/composer/utils/getAiChatMessageRecipientsToSend';
import { getAiChatNewThreadDirectMessageWorkspaceMemberId } from '@/ai-chat/composer/utils/getAiChatNewThreadDirectMessageWorkspaceMemberId';
import { getCanSendAiChatMessage } from '@/ai-chat/composer/utils/getCanSendAiChatMessage';
import { isAiChatInstanceShowingThread } from '@/ai-chat/composer/utils/isAiChatInstanceShowingThread';
import { aiChatComposerDraftsState } from '@/ai-chat/states/composer/aiChatComposerDraftsState';
import { aiChatComposerQuotedMessageIdFamilyState } from '@/ai-chat/states/composer/aiChatComposerQuotedMessageIdFamilyState';
import { newAiChatThreadIdState } from '@/ai-chat/states/newAiChatThreadIdState';
import { aiChatThreadReplyIsSendingFamilyState } from '@/ai-chat/states/reply/aiChatThreadReplyIsSendingFamilyState';
import { aiChatThreadIsDirectMessageFamilySelector } from '@/ai-chat/threads/states/selectors/aiChatThreadIsDirectMessageFamilySelector';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { dispatchBrowserEvent } from '@/browser-event/utils/dispatchBrowserEvent';
import { aiModelsState } from '@/client-config/states/aiModelsState';
import { checkIfFeatureFlagIsEnabledOnWorkspace } from '@/workspace/utils/checkIfFeatureFlagIsEnabledOnWorkspace';
import { FeatureFlagKey } from '~/generated-metadata/graphql';

export const useSendAiChatMessage = () => {
  const { openNewAiChatAsDirectMessage } = useOpenNewAiChatAsDirectMessage();
  const { sendAiChatMessageToThread } = useSendAiChatMessageToThread();
  const apolloClient = useApolloClient();
  const { enqueueToast } = useToast();
  const store = useStore();

  const sendAiChatMessage = useCallback(
    async ({ threadId, instanceId, onThreadChange }: AiChatSendTarget) => {
      const currentWorkspace = store.get(currentWorkspaceState.atom);
      const isAiChatInboxEnabled = checkIfFeatureFlagIsEnabledOnWorkspace(
        FeatureFlagKey.IS_AI_CHAT_INBOX_ENABLED,
        currentWorkspace,
      );
      const isNewChat = threadId === store.get(newAiChatThreadIdState.atom);
      const isDirectMessage = store.get(
        aiChatThreadIsDirectMessageFamilySelector.selectorFamily(threadId),
      );

      if (
        isNewChat &&
        store.get(
          aiChatThreadReplyIsSendingFamilyState.atomFamily({ threadId }),
        )
      ) {
        return;
      }

      const newThreadRecipients =
        isNewChat && isAiChatInboxEnabled
          ? store.get(
              aiChatComposerNewThreadRecipientsFamilyState.atomFamily(threadId),
            )
          : undefined;
      const serializedContentToSend =
        store.get(aiChatComposerDraftsState.atom)[threadId] ?? '';
      const draftText = tipTapDocumentToMarkdown(
        serializedContentToSend,
      ).trim();

      if (draftText === '') {
        return;
      }

      const { contentToSend, quotedMessageId } = getAiChatMessageContentToSend({
        store,
        apolloClient,
        threadId,
        draftText,
      });
      const {
        participantMentions,
        isAssistantMentioned,
        channelId,
        initialRecipients,
        hasRecipients,
      } = getAiChatMessageRecipientsToSend({
        store,
        threadId,
        isNewChat,
        isDirectMessage,
        newThreadRecipients,
        serializedContentToSend,
      });

      if (isDefined(newThreadRecipients) && !hasRecipients) {
        enqueueToast({
          status: 'error',
          children: t`Add a recipient or a channel before sending.`,
        });

        return;
      }

      if (
        !getCanSendAiChatMessage({
          aiModels: store.get(aiModelsState.atom),
          isAiChatInboxEnabled,
        })
      ) {
        enqueueToast({
          status: 'error',
          children: t`No AI provider is configured on this instance.`,
        });

        return;
      }

      const directMessageWorkspaceMemberId =
        getAiChatNewThreadDirectMessageWorkspaceMemberId({
          isDirectMessageIdentityEnabled:
            checkIfFeatureFlagIsEnabledOnWorkspace(
              FeatureFlagKey.IS_AGENT_CHAT_DIRECT_MESSAGE_IDENTITY_ENABLED,
              currentWorkspace,
            ),
          newThreadRecipients,
          isAssistantMentioned,
          channelId,
          initialRecipients,
          participantMentions,
        });

      if (isDefined(directMessageWorkspaceMemberId)) {
        const directMessageThreadId = await openNewAiChatAsDirectMessage({
          newChatThreadId: threadId,
          workspaceMemberId: directMessageWorkspaceMemberId,
          serializedDraft: serializedContentToSend,
        });

        if (!isDefined(directMessageThreadId)) {
          return;
        }

        if (isAiChatInstanceShowingThread({ store, instanceId, threadId })) {
          onThreadChange(directMessageThreadId);
        }

        await sendAiChatMessageToThread({
          threadId: directMessageThreadId,
          isNewChat: false,
          isDirectMessage: true,
          newThreadRecipients: undefined,
          serializedContentToSend,
          contentToSend,
          participantMentions: [],
          initialRecipients: [],
          isAssistantMentioned: false,
          channelId: undefined,
          quotedMessageId: null,
          instanceId,
          onThreadChange,
        });
        return;
      }

      const aiChatComposerUploadingFiles = store.get(
        aiChatComposerUploadingFilesFamilyState.atomFamily({ threadId }),
      );

      if (!isDirectMessage && aiChatComposerUploadingFiles.length > 0) {
        enqueueToast({
          status: 'error',
          children: t`Wait for the attachments to finish uploading.`,
        });

        return;
      }

      if (isNewChat) {
        onThreadChange(threadId);
      }

      store.set(aiChatComposerDraftsState.atom, (aiChatComposerDrafts) => ({
        ...aiChatComposerDrafts,
        [threadId]: '',
      }));
      store.set(
        aiChatComposerQuotedMessageIdFamilyState.atomFamily({ threadId }),
        null,
      );

      dispatchBrowserEvent<AiChatRestoreEditorContentEventDetail>(
        AI_CHAT_RESTORE_EDITOR_CONTENT_EVENT_NAME,
        { threadId, content: '' },
      );

      await sendAiChatMessageToThread({
        threadId,
        isNewChat,
        isDirectMessage,
        newThreadRecipients,
        serializedContentToSend,
        contentToSend,
        participantMentions,
        initialRecipients,
        isAssistantMentioned,
        channelId,
        quotedMessageId,
        instanceId,
        onThreadChange,
      });
    },
    [
      store,
      apolloClient,
      openNewAiChatAsDirectMessage,
      enqueueToast,
      sendAiChatMessageToThread,
    ],
  );

  return { sendAiChatMessage };
};
