import { refetchAiChatThreadMessages } from '@/ai-chat/utils/refetchAiChatThreadMessages';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { currentWorkspaceMembersState } from '@/auth/states/currentWorkspaceMembersState';
import { useApolloClient } from '@apollo/client/react';
import { isUndefined } from '@sniptt/guards';
import { t } from '@lingui/core/macro';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { type ExtendedUIMessage } from 'twenty-shared/ai';
import {
  isDefined,
  isNonEmptyArray,
  tipTapDocumentToMarkdown,
} from 'twenty-shared/utils';
import { useToast } from 'twenty-ui/components/feedback';
import { v4 } from 'uuid';

import { AI_CHAT_NEW_THREAD_DEFAULT_RECIPIENTS } from '@/ai-chat/constants/AiChatNewThreadDefaultRecipients';
import { AI_CHAT_RESTORE_EDITOR_CONTENT_EVENT_NAME } from '@/ai-chat/composer/constants/AiChatRestoreEditorContentEventName';
import { useAttachChatThreadToRecord } from '@/ai-chat/threads/hooks/useAttachChatThreadToRecord';
import { useGetBrowsingContext } from '@/ai-chat/hooks/useGetBrowsingContext';
import { useOpenNewAiChatAsDirectMessage } from '@/ai-chat/composer/hooks/useOpenNewAiChatAsDirectMessage';
import { useOptimisticallyRestoreOnSend } from '@/ai-chat/composer/hooks/useOptimisticallyRestoreOnSend';
import { useRefreshAiChatThreadPermissions } from '@/ai-chat/threads/hooks/useRefreshAiChatThreadPermissions';
import { useWarnAboutParticipantMentionsNotAdded } from '@/ai-chat/composer/hooks/useWarnAboutParticipantMentionsNotAdded';
import { aiChatComposerDraftsState } from '@/ai-chat/states/composer/aiChatComposerDraftsState';
import { aiChatComposerQuotedMessageIdFamilyState } from '@/ai-chat/states/composer/aiChatComposerQuotedMessageIdFamilyState';
import { aiChatMessageAuthorLookupSelector } from '@/ai-chat/messages/states/selectors/aiChatMessageAuthorLookupSelector';
import { aiChatThreadMessageFamilySelector } from '@/ai-chat/states/selectors/aiChatThreadMessageFamilySelector';
import { getAiChatMessageAuthor } from '@/ai-chat/messages/utils/getAiChatMessageAuthor';
import { getCanSendAiChatMessage } from '@/ai-chat/composer/utils/getCanSendAiChatMessage';
import { getAiChatMessageQuoteSource } from '@/ai-chat/composer/utils/getAiChatMessageQuoteSource';
import { prependAiChatQuoteToText } from '@/ai-chat/composer/utils/prependAiChatQuoteToText';
import { aiChatThreadReplyLastBrowsingContextFamilyState } from '@/ai-chat/states/reply/aiChatThreadReplyLastBrowsingContextFamilyState';
import { aiChatComposerUploadingFilesFamilyState } from '@/ai-chat/states/composer/aiChatComposerUploadingFilesFamilyState';
import { aiChatSentMessageHandOffState } from '@/ai-chat/states/aiChatSentMessageHandOffState';
import { aiChatComposerAttachmentsFamilyState } from '@/ai-chat/states/composer/aiChatComposerAttachmentsFamilyState';
import { aiChatThreadReplyUnconfirmedFirstMessageFamilyState } from '@/ai-chat/states/reply/aiChatThreadReplyUnconfirmedFirstMessageFamilyState';
import { aiChatThreadIsDirectMessageFamilySelector } from '@/ai-chat/threads/states/selectors/aiChatThreadIsDirectMessageFamilySelector';
import { aiChatThreadReplyErrorFamilyState } from '@/ai-chat/states/reply/aiChatThreadReplyErrorFamilyState';
import { aiChatThreadIsFetchingMessagesFamilyState } from '@/ai-chat/states/server/aiChatThreadIsFetchingMessagesFamilyState';
import { aiChatThreadReplyStatusFamilyState } from '@/ai-chat/states/reply/aiChatThreadReplyStatusFamilyState';
import { endAiChatReplyStatus } from '@/ai-chat/utils/endAiChatReplyStatus';
import { getAiChatModelIdForRequest } from '@/ai-chat/utils/getAiChatModelIdForRequest';
import { getAiChatReplyStatusUnlessStreaming } from '@/ai-chat/utils/getAiChatReplyStatusUnlessStreaming';
import { aiChatThreadReplyIsSendingFamilyState } from '@/ai-chat/states/reply/aiChatThreadReplyIsSendingFamilyState';
import { aiChatThreadDisplayedMessagesFamilyState } from '@/ai-chat/states/display/aiChatThreadDisplayedMessagesFamilyState';
import { aiChatRequiredThreadListenersState } from '@/ai-chat/states/aiChatRequiredThreadListenersState';
import { aiChatComposerNewThreadRecipientsFamilyState } from '@/ai-chat/states/composer/aiChatComposerNewThreadRecipientsFamilyState';
import { newAiChatThreadIdState } from '@/ai-chat/states/newAiChatThreadIdState';
import { type AiChatNewThreadRecipients } from '@/ai-chat/types/AiChatNewThreadRecipients';
import { type AiChatParticipantMention } from '@/ai-chat/composer/types/AiChatParticipantMention';
import { type AiChatRestoreEditorContentEventDetail } from '@/ai-chat/composer/types/AiChatRestoreEditorContentEventDetail';
import { getConversationTargetsFromSerializedDocument } from '@/ai-chat/composer/utils/getConversationTargetsFromSerializedDocument';
import { getAiChatInitialRecipients } from '@/ai-chat/composer/utils/getAiChatInitialRecipients';
import { getAiChatNewThreadDirectMessageWorkspaceMemberId } from '@/ai-chat/composer/utils/getAiChatNewThreadDirectMessageWorkspaceMemberId';
import { getParticipantMentionsFromSerializedDocument } from '@/ai-chat/composer/utils/getParticipantMentionsFromSerializedDocument';
import { isAiChatAssistantMentionedInSerializedDocument } from '@/ai-chat/composer/utils/isAiChatAssistantMentionedInSerializedDocument';
import { isAiChatCreditsExhaustedError } from '@/ai-chat/usage/utils/isAiChatCreditsExhaustedError';
import { toAiChatError } from '@/ai-chat/utils/toAiChatError';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { dispatchBrowserEvent } from '@/browser-event/utils/dispatchBrowserEvent';
import { aiModelsState } from '@/client-config/states/aiModelsState';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { checkIfFeatureFlagIsEnabledOnWorkspace } from '@/workspace/utils/checkIfFeatureFlagIsEnabledOnWorkspace';
import {
  markWorkspaceCreditsAvailable,
  markWorkspaceCreditsExhausted,
} from '@/workspace/utils/updateWorkspaceResourceCreditCap';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';
import {
  FindChatMessageAgentDocument,
  SendChatMessageDocument,
  FeatureFlagKey,
} from '~/generated-metadata/graphql';
import { logError } from '~/utils/logError';

type AiChatSendTarget = {
  threadId: string;
  instanceId?: string;
  onThreadChange: (threadId: string) => void;
};

type AiChatMessageToSend = Pick<
  AiChatSendTarget,
  'instanceId' | 'onThreadChange'
> & {
  threadId: string;
  isNewChat: boolean;
  isDirectMessage: boolean;
  newInboxChatRecipients: AiChatNewThreadRecipients | undefined;
  serializedContentToSend: string;
  contentToSend: string;
  participantMentions: AiChatParticipantMention[];
  initialRecipients: AiChatParticipantMention[];
  isAssistantMentioned: boolean;
  channelId: string | null | undefined;
  quotedMessageId: string | null;
};

export const useSendAiChatMessage = () => {
  const { openNewAiChatAsDirectMessage } = useOpenNewAiChatAsDirectMessage();
  const { getBrowsingContext } = useGetBrowsingContext();
  const { applyOptimisticRestore } = useOptimisticallyRestoreOnSend();
  const { attachChatThreadToRecord } = useAttachChatThreadToRecord();
  const { warnAboutParticipantMentionsNotAdded } =
    useWarnAboutParticipantMentionsNotAdded();
  const apolloClient = useApolloClient();
  const { enqueueToast } = useToast();
  const { refreshAiChatThreadPermissions } =
    useRefreshAiChatThreadPermissions();
  const store = useStore();

  const setAiChatComposerDrafts = useSetAtomState(aiChatComposerDraftsState);

  const sendToThread = useCallback(
    async ({
      threadId,
      isNewChat,
      isDirectMessage,
      newInboxChatRecipients,
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
        {
          threadId,
        },
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
      const browsingContextToSend = isBrowsingContextChanged
        ? browsingContext
        : null;
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

      const optimisticUserMessage: ExtendedUIMessage = {
        id: messageId,
        role: 'user',
        parts: [
          { type: 'text' as const, text: contentToSend },
          ...aiChatComposerAttachments,
        ],
        metadata: {
          createdAt: optimisticMessageCreatedAt,
          senderWorkspaceMemberId: store.get(currentWorkspaceMemberState.atom)
            ?.id,
        },
        status: 'sent',
      };

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
        optimisticUserMessage,
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
            browsingContext: isDirectMessage ? null : browsingContextToSend,
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
            isAssistantParticipant:
              newInboxChatRecipients?.isAssistantParticipant,
            isAssistantMentioned,
            recipientWorkspaceMemberIds: isDefined(newInboxChatRecipients)
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

          if (
            !isDefined(instanceId) ||
            store.get(aiChatRequiredThreadListenersState.atom)[instanceId] ===
              threadId
          ) {
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

        setAiChatComposerDrafts((prev) => ({
          ...prev,
          [threadId]: serializedContentToSend,
        }));
        store.set(uploadedFilesAtom, (currentUploadedFiles) => [
          ...aiChatComposerAttachments,
          ...currentUploadedFiles,
        ]);

        const quotedMessageIdAtom =
          aiChatComposerQuotedMessageIdFamilyState.atomFamily({ threadId });

        if (!isDefined(store.get(quotedMessageIdAtom))) {
          store.set(quotedMessageIdAtom, quotedMessageId);
        }

        removeOptimisticUserMessage();
        store.set(errorAtom, toAiChatError(error));

        if (isAiChatCreditsExhaustedError(error)) {
          store.set(currentWorkspaceState.atom, markWorkspaceCreditsExhausted);
        }

        dispatchBrowserEvent<AiChatRestoreEditorContentEventDetail>(
          AI_CHAT_RESTORE_EDITOR_CONTENT_EVENT_NAME,
          { threadId, content: serializedContentToSend },
        );
      } finally {
        store.set(isSendingMessageAtom, false);
      }
    },
    [
      store,
      getBrowsingContext,
      setAiChatComposerDrafts,
      refreshAiChatThreadPermissions,
      apolloClient,
      applyOptimisticRestore,
      attachChatThreadToRecord,
      warnAboutParticipantMentionsNotAdded,
    ],
  );

  const sendAiChatMessage = useCallback(
    async ({ threadId, instanceId, onThreadChange }: AiChatSendTarget) => {
      const newAiChatThreadId = store.get(newAiChatThreadIdState.atom);
      const currentWorkspace = store.get(currentWorkspaceState.atom);
      const isAiChatInboxEnabled = checkIfFeatureFlagIsEnabledOnWorkspace(
        FeatureFlagKey.IS_AI_CHAT_INBOX_ENABLED,
        currentWorkspace,
      );
      const isNewChat = threadId === newAiChatThreadId;
      const isDirectMessage = store.get(
        aiChatThreadIsDirectMessageFamilySelector.selectorFamily(threadId),
      );
      const isSendingMessageAtom =
        aiChatThreadReplyIsSendingFamilyState.atomFamily({
          threadId,
        });

      if (isNewChat && store.get(isSendingMessageAtom)) {
        return;
      }

      const newInboxChatRecipients =
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

      const quotedMessageIdAtom =
        aiChatComposerQuotedMessageIdFamilyState.atomFamily({
          threadId,
        });
      const quotedMessageId = store.get(quotedMessageIdAtom);
      const quotedMessage = store.get(
        aiChatThreadMessageFamilySelector.selectorFamily({
          threadId,
          messageId: quotedMessageId,
        }),
      );
      const quotedAgentId = quotedMessage?.metadata?.agentId;
      // the composer preview starts loading the agent when the quote is picked; awaiting it here would race with further edits
      const quotedAgentName = isDefined(quotedAgentId)
        ? (apolloClient.cache.readQuery({
            query: FindChatMessageAgentDocument,
            variables: { id: quotedAgentId },
          })?.findOneAgent.label ?? undefined)
        : undefined;
      const quotedMessageSource = isDefined(quotedMessage)
        ? getAiChatMessageQuoteSource({
            message: quotedMessage,
            author: getAiChatMessageAuthor({
              message: quotedMessage,
              authorLookup: store.get(aiChatMessageAuthorLookupSelector.atom),
              agentName: quotedAgentName,
            }),
          })
        : null;
      const contentToSend = isDefined(quotedMessageSource)
        ? prependAiChatQuoteToText({
            text: draftText,
            authorName: quotedMessageSource.author.name,
            excerpt: quotedMessageSource.excerpt,
          })
        : draftText;

      const currentWorkspaceMemberId = store.get(
        currentWorkspaceMemberState.atom,
      )?.id;
      const participantMentions = isDirectMessage
        ? []
        : getParticipantMentionsFromSerializedDocument(
            serializedContentToSend,
          ).filter(
            ({ workspaceMemberId }) =>
              workspaceMemberId !== currentWorkspaceMemberId,
          );
      const isAssistantMentioned =
        isAiChatAssistantMentionedInSerializedDocument(serializedContentToSend);
      const channelId = isNewChat
        ? store.get(
            aiChatComposerNewThreadRecipientsFamilyState.atomFamily(threadId),
          ).channelId
        : undefined;
      const initialRecipients = getAiChatInitialRecipients({
        recipientWorkspaceMemberIds:
          newInboxChatRecipients?.recipientWorkspaceMemberIds ?? [],
        workspaceMembers: store.get(currentWorkspaceMembersState.atom),
      });
      const hasRecipients =
        newInboxChatRecipients?.isAssistantParticipant ||
        isAssistantMentioned ||
        isNonEmptyArray(initialRecipients) ||
        isNonEmptyArray(participantMentions) ||
        isDefined(channelId);

      if (isDefined(newInboxChatRecipients) && !hasRecipients) {
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
          newInboxChatRecipients,
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

        if (
          !isDefined(instanceId) ||
          store.get(aiChatRequiredThreadListenersState.atom)[instanceId] ===
            threadId
        ) {
          onThreadChange(directMessageThreadId);
        }

        await sendToThread({
          threadId: directMessageThreadId,
          isNewChat: false,
          isDirectMessage: true,
          newInboxChatRecipients: undefined,
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

      setAiChatComposerDrafts((prev) => ({
        ...prev,
        [threadId]: '',
      }));
      store.set(quotedMessageIdAtom, null);

      dispatchBrowserEvent<AiChatRestoreEditorContentEventDetail>(
        AI_CHAT_RESTORE_EDITOR_CONTENT_EVENT_NAME,
        { threadId, content: '' },
      );

      await sendToThread({
        threadId,
        isNewChat,
        isDirectMessage,
        newInboxChatRecipients,
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
      setAiChatComposerDrafts,
      openNewAiChatAsDirectMessage,
      enqueueToast,
      sendToThread,
    ],
  );

  return { sendAiChatMessage };
};
