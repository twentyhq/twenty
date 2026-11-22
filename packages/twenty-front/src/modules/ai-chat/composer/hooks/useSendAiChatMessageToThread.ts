import { useApolloClient } from '@apollo/client/react';
import { isUndefined } from '@sniptt/guards';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import { v4 } from 'uuid';

import { AI_CHAT_NEW_THREAD_DEFAULT_RECIPIENTS } from '@/ai-chat/composer/constants/AiChatNewThreadDefaultRecipients';
import { useOptimisticallyRestoreOnSend } from '@/ai-chat/composer/hooks/useOptimisticallyRestoreOnSend';
import { useWarnAboutParticipantMentionsNotAdded } from '@/ai-chat/composer/hooks/useWarnAboutParticipantMentionsNotAdded';
import { aiChatComposerAttachmentsFamilyState } from '@/ai-chat/composer/states/aiChatComposerAttachmentsFamilyState';
import { aiChatComposerNewThreadRecipientsFamilyState } from '@/ai-chat/composer/states/aiChatComposerNewThreadRecipientsFamilyState';
import { aiChatThreadReplyLastBrowsingContextFamilyState } from '@/ai-chat/composer/states/aiChatThreadReplyLastBrowsingContextFamilyState';
import { aiChatThreadReplyUnconfirmedFirstMessageFamilyState } from '@/ai-chat/composer/states/aiChatThreadReplyUnconfirmedFirstMessageFamilyState';
import { type AiChatMessageToSend } from '@/ai-chat/composer/types/AiChatMessageToSend';
import { createOptimisticAiChatUserMessage } from '@/ai-chat/composer/utils/createOptimisticAiChatUserMessage';
import { getConversationTargetsFromSerializedDocument } from '@/ai-chat/composer/utils/getConversationTargetsFromSerializedDocument';
import { isAiChatInstanceShowingThread } from '@/ai-chat/composer/utils/isAiChatInstanceShowingThread';
import { restoreAiChatComposerAfterFailedSend } from '@/ai-chat/composer/utils/restoreAiChatComposerAfterFailedSend';
import { useGetBrowsingContext } from '@/ai-chat/hooks/useGetBrowsingContext';
import { aiChatThreadDisplayedMessagesFamilyState } from '@/ai-chat/states/display/aiChatThreadDisplayedMessagesFamilyState';
import { aiChatSentMessageHandOffState } from '@/ai-chat/states/aiChatSentMessageHandOffState';
import { newAiChatThreadIdState } from '@/ai-chat/states/newAiChatThreadIdState';
import { aiChatThreadReplyErrorFamilyState } from '@/ai-chat/states/reply/aiChatThreadReplyErrorFamilyState';
import { aiChatThreadReplyIsSendingFamilyState } from '@/ai-chat/states/reply/aiChatThreadReplyIsSendingFamilyState';
import { aiChatThreadReplyStatusFamilyState } from '@/ai-chat/states/reply/aiChatThreadReplyStatusFamilyState';
import { aiChatThreadIsFetchingMessagesFamilyState } from '@/ai-chat/states/server/aiChatThreadIsFetchingMessagesFamilyState';
import { useAttachAiChatThreadToRecord } from '@/ai-chat/threads/hooks/useAttachAiChatThreadToRecord';
import { useRefreshAiChatThreadPermissions } from '@/ai-chat/threads/hooks/useRefreshAiChatThreadPermissions';
import { isAiChatCreditsExhaustedError } from '@/ai-chat/usage/utils/isAiChatCreditsExhaustedError';
import { endAiChatReplyStatus } from '@/ai-chat/utils/endAiChatReplyStatus';
import { getAiChatModelIdForRequest } from '@/ai-chat/utils/getAiChatModelIdForRequest';
import { getAiChatReplyStatusUnlessStreaming } from '@/ai-chat/utils/getAiChatReplyStatusUnlessStreaming';
import { refetchAiChatThreadMessages } from '@/ai-chat/utils/refetchAiChatThreadMessages';
import { toAiChatError } from '@/ai-chat/utils/toAiChatError';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { aiModelsState } from '@/client-config/states/aiModelsState';
import {
  markWorkspaceCreditsAvailable,
  markWorkspaceCreditsExhausted,
} from '@/workspace/utils/updateWorkspaceResourceCreditCap';
import { SendChatMessageDocument } from '~/generated-metadata/graphql';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';
import { logError } from '~/utils/logError';

export const useSendAiChatMessageToThread = () => {
  const { getBrowsingContext } = useGetBrowsingContext();
  const { applyOptimisticRestore } = useOptimisticallyRestoreOnSend();
  const { attachChatThreadToRecord } = useAttachAiChatThreadToRecord();
  const { warnAboutParticipantMentionsNotAdded } =
    useWarnAboutParticipantMentionsNotAdded();
  const { refreshAiChatThreadPermissions } =
    useRefreshAiChatThreadPermissions();
  const apolloClient = useApolloClient();
  const store = useStore();

  const sendAiChatMessageToThread = useCallback(
    async ({
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
    }: AiChatMessageToSend) => {
      const isSendingMessageAtom =
        aiChatThreadReplyIsSendingFamilyState.atomFamily({ threadId });
      const uploadedFilesAtom = aiChatComposerAttachmentsFamilyState.atomFamily(
        { threadId },
      );
      const aiChatComposerAttachments = isDirectMessage
        ? []
        : store.get(uploadedFilesAtom);
      const browsingContext = getBrowsingContext();
      const lastSentBrowsingContextAtom =
        aiChatThreadReplyLastBrowsingContextFamilyState.atomFamily(threadId);
      const lastSentBrowsingContext = store.get(lastSentBrowsingContextAtom);
      const isBrowsingContextChanged = isUndefined(lastSentBrowsingContext)
        ? isDefined(browsingContext)
        : !isDeeplyEqual(browsingContext, lastSentBrowsingContext, {
            strict: true,
          });
      const fileIds = aiChatComposerAttachments.map(({ fileId }) => fileId);
      const unconfirmedFirstMessageAtom =
        aiChatThreadReplyUnconfirmedFirstMessageFamilyState.atomFamily(
          threadId,
        );
      const unconfirmedFirstMessage = isNewChat
        ? store.get(unconfirmedFirstMessageAtom)
        : null;
      const messageId =
        unconfirmedFirstMessage?.text === contentToSend &&
        isDeeplyEqual(unconfirmedFirstMessage.fileIds, fileIds)
          ? unconfirmedFirstMessage.messageId
          : v4();
      const optimisticMessageCreatedAt = new Date().toISOString();
      const rollbackOptimisticRestore = applyOptimisticRestore({
        threadId,
        optimisticUpdatedAt: optimisticMessageCreatedAt,
      });

      const messagesAtom = aiChatThreadDisplayedMessagesFamilyState.atomFamily({
        threadId,
      });
      const errorAtom = aiChatThreadReplyErrorFamilyState.atomFamily({
        threadId,
      });
      const replyStatusAtom = aiChatThreadReplyStatusFamilyState.atomFamily({
        threadId,
      });
      const removeOptimisticUserMessage = () => {
        store.set(messagesAtom, (messages) =>
          messages.filter((message) => message.id !== messageId),
        );
        store.set(
          replyStatusAtom,
          endAiChatReplyStatus('awaiting-first-chunk'),
        );
      };

      store.set(aiChatSentMessageHandOffState.atom, (sentMessageHandOff) =>
        isDefined(sentMessageHandOff)
          ? { ...sentMessageHandOff, messageId }
          : null,
      );
      store.set(messagesAtom, (messages) => [
        ...messages,
        createOptimisticAiChatUserMessage({
          messageId,
          text: contentToSend,
          attachments: aiChatComposerAttachments,
          createdAt: optimisticMessageCreatedAt,
          senderWorkspaceMemberId: store.get(currentWorkspaceMemberState.atom)
            ?.id,
        }),
      ]);
      store.set(errorAtom, null);
      store.set(
        replyStatusAtom,
        getAiChatReplyStatusUnlessStreaming('awaiting-first-chunk'),
      );

      const fileAttachments = aiChatComposerAttachments.map((file) => ({
        id: file.fileId,
        filename: file.filename,
      }));

      if (!isDirectMessage) {
        store.set(uploadedFilesAtom, []);
      }

      store.set(isSendingMessageAtom, true);

      try {
        const { data } = await apolloClient.mutate({
          mutation: SendChatMessageDocument,
          variables: {
            threadId,
            text: contentToSend,
            messageId,
            browsingContext:
              isDirectMessage || !isBrowsingContextChanged
                ? null
                : browsingContext,
            modelId: isDirectMessage
              ? undefined
              : getAiChatModelIdForRequest(store),
            fileAttachments:
              fileAttachments.length > 0 ? fileAttachments : undefined,
            mentionedWorkspaceMemberIds:
              participantMentions.length > 0
                ? participantMentions.map(
                    ({ workspaceMemberId }) => workspaceMemberId,
                  )
                : undefined,
            channelId,
            shouldAssistantReply: isNonEmptyArray(
              store.get(aiModelsState.atom),
            ),
            isAssistantParticipant: newThreadRecipients?.isAssistantParticipant,
            isAssistantMentioned,
            recipientWorkspaceMemberIds: isDefined(newThreadRecipients)
              ? initialRecipients.map(
                  ({ workspaceMemberId }) => workspaceMemberId,
                )
              : undefined,
          },
        });

        const isAssistantReplying =
          data?.sendChatMessage.queued ||
          isDefined(data?.sendChatMessage.streamId);

        if (isAssistantReplying) {
          if (!isAiChatCreditsExhaustedError(store.get(errorAtom))) {
            store.set(
              currentWorkspaceState.atom,
              markWorkspaceCreditsAvailable,
            );
          }

          if (isBrowsingContextChanged) {
            store.set(lastSentBrowsingContextAtom, browsingContext);
          }
        } else {
          store.set(
            replyStatusAtom,
            endAiChatReplyStatus('awaiting-first-chunk'),
          );
          store.set(
            aiChatThreadIsFetchingMessagesFamilyState.atomFamily({ threadId }),
            true,
          );
        }

        if (!isDirectMessage) {
          for (const conversationTarget of getConversationTargetsFromSerializedDocument(
            serializedContentToSend,
          )) {
            void attachChatThreadToRecord({ threadId, ...conversationTarget });
          }
        }
        void warnAboutParticipantMentionsNotAdded({
          threadId,
          participantMentions,
          initialRecipients,
          addedWorkspaceMemberIds: [
            ...(data?.sendChatMessage.mentionedParticipantWorkspaceMemberIds ??
              []),
            ...(data?.sendChatMessage.recipientParticipantWorkspaceMemberIds ??
              []),
          ],
        }).catch(logError);

        if (data?.sendChatMessage.queued) {
          removeOptimisticUserMessage();
        }

        if (isNewChat) {
          await refreshAiChatThreadPermissions([threadId]);
          store.set(newAiChatThreadIdState.atom, v4());
          store.set(unconfirmedFirstMessageAtom, null);
          store.set(
            aiChatComposerNewThreadRecipientsFamilyState.atomFamily(threadId),
            AI_CHAT_NEW_THREAD_DEFAULT_RECIPIENTS,
          );

          if (isAiChatInstanceShowingThread({ store, instanceId, threadId })) {
            onThreadChange(threadId);
          }
        }

        refetchAiChatThreadMessages(threadId);
      } catch (error) {
        rollbackOptimisticRestore();

        if (isNewChat) {
          store.set(unconfirmedFirstMessageAtom, {
            messageId,
            text: contentToSend,
            fileIds,
          });
        }

        removeOptimisticUserMessage();
        store.set(errorAtom, toAiChatError(error));

        if (isAiChatCreditsExhaustedError(error)) {
          store.set(currentWorkspaceState.atom, markWorkspaceCreditsExhausted);
        }

        restoreAiChatComposerAfterFailedSend({
          store,
          threadId,
          serializedContent: serializedContentToSend,
          attachments: aiChatComposerAttachments,
          quotedMessageId,
        });
      } finally {
        store.set(isSendingMessageAtom, false);
      }
    },
    [
      store,
      getBrowsingContext,
      refreshAiChatThreadPermissions,
      apolloClient,
      applyOptimisticRestore,
      attachChatThreadToRecord,
      warnAboutParticipantMentionsNotAdded,
    ],
  );

  return { sendAiChatMessageToThread };
};
