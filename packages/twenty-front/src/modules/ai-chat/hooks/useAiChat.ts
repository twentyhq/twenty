import { dispatchAiChatRefetchMessagesEvent } from '@/ai-chat/utils/dispatchAiChatRefetchMessagesEvent';
import { currentWorkspaceMemberState } from '@/auth/states/currentWorkspaceMemberState';
import { currentWorkspaceMembersState } from '@/auth/states/currentWorkspaceMembersState';
import { getToastOptionsFromError } from '@/error-handler/utils/getToastOptionsFromError';
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
import { useAiChatInstanceOrThrow } from '@/ai-chat/hooks/useAiChatInstanceOrThrow';
import { useAiChatModelId } from '@/ai-chat/hooks/useAiChatModelId';
import { useAttachChatThreadToRecord } from '@/ai-chat/threads/hooks/useAttachChatThreadToRecord';
import { useCanSendAiChatMessage } from '@/ai-chat/composer/hooks/useCanSendAiChatMessage';
import { useGetBrowsingContext } from '@/ai-chat/hooks/useGetBrowsingContext';
import { useOpenNewAiChatAsDirectMessage } from '@/ai-chat/composer/hooks/useOpenNewAiChatAsDirectMessage';
import { useOptimisticallyRestoreOnSend } from '@/ai-chat/composer/hooks/useOptimisticallyRestoreOnSend';
import { useRefreshAiChatThreadPermissions } from '@/ai-chat/threads/hooks/useRefreshAiChatThreadPermissions';
import { useWarnAboutParticipantMentionsNotAdded } from '@/ai-chat/composer/hooks/useWarnAboutParticipantMentionsNotAdded';
import { aiChatDraftsByThreadIdState } from '@/ai-chat/states/aiChatDraftsByThreadIdState';
import { aiChatQuotedMessageIdFamilyState } from '@/ai-chat/states/aiChatQuotedMessageIdFamilyState';
import { aiChatMessageAuthorLookupSelector } from '@/ai-chat/messages/states/selectors/aiChatMessageAuthorLookupSelector';
import { aiChatThreadMessageFamilySelector } from '@/ai-chat/states/selectors/aiChatThreadMessageFamilySelector';
import { getAiChatMessageAuthor } from '@/ai-chat/messages/utils/getAiChatMessageAuthor';
import { getAiChatMessageQuoteSource } from '@/ai-chat/composer/utils/getAiChatMessageQuoteSource';
import { prependAiChatQuoteToText } from '@/ai-chat/composer/utils/prependAiChatQuoteToText';
import { aiChatLastSentBrowsingContextFamilyState } from '@/ai-chat/states/aiChatLastSentBrowsingContextFamilyState';
import { aiChatSelectedFilesFamilyState } from '@/ai-chat/composer/states/aiChatSelectedFilesFamilyState';
import { aiChatSentMessageHandOffState } from '@/ai-chat/states/aiChatSentMessageHandOffState';
import { aiChatUploadedFilesFamilyState } from '@/ai-chat/composer/states/aiChatUploadedFilesFamilyState';
import { aiChatUnconfirmedFirstMessageFamilyState } from '@/ai-chat/composer/states/aiChatUnconfirmedFirstMessageFamilyState';
import { aiChatThreadIsDirectMessageFamilySelector } from '@/ai-chat/threads/states/selectors/aiChatThreadIsDirectMessageFamilySelector';
import { aiChatErrorFamilyState } from '@/ai-chat/states/aiChatErrorFamilyState';
import { aiChatIsAwaitingFirstChunkFamilyState } from '@/ai-chat/states/aiChatIsAwaitingFirstChunkFamilyState';
import { aiChatIsAwaitingPersistedRefetchFamilyState } from '@/ai-chat/states/aiChatIsAwaitingPersistedRefetchFamilyState';
import { aiChatIsSendingMessageFamilyState } from '@/ai-chat/states/aiChatIsSendingMessageFamilyState';
import { aiChatMessagesFamilyState } from '@/ai-chat/states/aiChatMessagesFamilyState';
import { aiChatOpenThreadIdByInstanceIdState } from '@/ai-chat/states/aiChatOpenThreadIdByInstanceIdState';
import { aiChatNewThreadChannelIdState } from '@/ai-chat/composer/states/aiChatNewThreadChannelIdState';
import { aiChatNewThreadRecipientsFamilyState } from '@/ai-chat/states/aiChatNewThreadRecipientsFamilyState';
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
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import {
  markWorkspaceCreditsAvailable,
  markWorkspaceCreditsExhausted,
} from '@/workspace/utils/updateWorkspaceResourceCreditCap';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';
import {
  FindChatMessageAgentDocument,
  SendChatMessageDocument,
  StopAgentChatStreamDocument,
  FeatureFlagKey,
} from '~/generated-metadata/graphql';
import { logError } from '~/utils/logError';

type AiChatMessageToSend = {
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

export const useAiChat = () => {
  const {
    instanceId,
    threadId: aiChatThreadId,
    onThreadChange,
  } = useAiChatInstanceOrThrow();
  const { modelIdForRequest } = useAiChatModelId();
  const aiModels = useAtomStateValue(aiModelsState);
  const canSendAiChatMessage = useCanSendAiChatMessage();
  const isAiChatInboxEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_AI_CHAT_INBOX_ENABLED,
  );
  const isDirectMessageIdentityEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_AGENT_CHAT_DIRECT_MESSAGE_IDENTITY_ENABLED,
  );
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

  const setAiChatDraftsByThreadId = useSetAtomState(
    aiChatDraftsByThreadIdState,
  );

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
    }: AiChatMessageToSend) => {
      const isSendingMessageAtom = aiChatIsSendingMessageFamilyState.atomFamily(
        { threadId },
      );
      const uploadedFilesAtom = aiChatUploadedFilesFamilyState.atomFamily({
        threadId,
      });
      const aiChatUploadedFiles = isDirectMessage
        ? []
        : store.get(uploadedFilesAtom);
      const browsingContext = getBrowsingContext();
      const lastSentBrowsingContextAtom =
        aiChatLastSentBrowsingContextFamilyState.atomFamily(threadId);
      const lastSentBrowsingContext = store.get(lastSentBrowsingContextAtom);
      const isBrowsingContextChanged = isUndefined(lastSentBrowsingContext)
        ? isDefined(browsingContext)
        : JSON.stringify(browsingContext) !==
          JSON.stringify(lastSentBrowsingContext);
      const browsingContextToSend = isBrowsingContextChanged
        ? browsingContext
        : null;
      const fileIds = aiChatUploadedFiles.map(({ fileId }) => fileId);
      const unconfirmedFirstMessageAtom =
        aiChatUnconfirmedFirstMessageFamilyState.atomFamily(threadId);
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
          ...aiChatUploadedFiles,
        ],
        metadata: {
          createdAt: optimisticMessageCreatedAt,
          senderWorkspaceMemberId: store.get(currentWorkspaceMemberState.atom)
            ?.id,
        },
        status: 'sent',
      };

      const messagesAtom = aiChatMessagesFamilyState.atomFamily({
        threadId,
      });
      const errorAtom = aiChatErrorFamilyState.atomFamily({ threadId });
      const isAwaitingFirstChunkAtom =
        aiChatIsAwaitingFirstChunkFamilyState.atomFamily({ threadId });
      const removeOptimisticUserMessage = () => {
        store.set(messagesAtom, (messages) =>
          messages.filter((message) => message.id !== messageId),
        );
        store.set(isAwaitingFirstChunkAtom, false);
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
      store.set(isAwaitingFirstChunkAtom, true);

      const fileAttachments = aiChatUploadedFiles.map((file) => ({
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
            modelId: isDirectMessage ? undefined : modelIdForRequest,
            fileAttachments:
              fileAttachments.length > 0 ? fileAttachments : undefined,
            mentionedWorkspaceMemberIds:
              participantMentions.length > 0
                ? participantMentions.map(
                    ({ workspaceMemberId }) => workspaceMemberId,
                  )
                : undefined,
            channelId,
            shouldAssistantReply: isNonEmptyArray(aiModels),
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
            aiChatIsAwaitingPersistedRefetchFamilyState.atomFamily({
              threadId,
            }),
            true,
          );
          store.set(isAwaitingFirstChunkAtom, false);
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
          store.set(aiChatNewThreadChannelIdState.atom, null);
          store.set(unconfirmedFirstMessageAtom, null);

          if (isDefined(newInboxChatRecipients)) {
            store.set(
              aiChatNewThreadRecipientsFamilyState.atomFamily(threadId),
              AI_CHAT_NEW_THREAD_DEFAULT_RECIPIENTS,
            );
          }

          const isInstanceStillOnThread =
            store.get(aiChatOpenThreadIdByInstanceIdState.atom)[instanceId] ===
            threadId;

          if (isInstanceStillOnThread) {
            onThreadChange(threadId);
          }
        }

        dispatchAiChatRefetchMessagesEvent(threadId);
      } catch (error) {
        rollbackOptimisticRestore();

        if (isNewChat) {
          store.set(unconfirmedFirstMessageAtom, {
            messageId,
            text: contentToSend,
            fileIds,
          });
        }

        setAiChatDraftsByThreadId((prev) => ({
          ...prev,
          [threadId]: serializedContentToSend,
        }));
        store.set(uploadedFilesAtom, (currentUploadedFiles) => [
          ...aiChatUploadedFiles,
          ...currentUploadedFiles,
        ]);

        const quotedMessageIdAtom = aiChatQuotedMessageIdFamilyState.atomFamily(
          { threadId },
        );

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
      instanceId,
      onThreadChange,
      getBrowsingContext,
      setAiChatDraftsByThreadId,
      modelIdForRequest,
      aiModels,
      refreshAiChatThreadPermissions,
      apolloClient,
      applyOptimisticRestore,
      attachChatThreadToRecord,
      warnAboutParticipantMentionsNotAdded,
    ],
  );

  const handleSendMessage = useCallback(async () => {
    const newAiChatThreadId = store.get(newAiChatThreadIdState.atom);
    const threadId = aiChatThreadId;
    const isNewChat = threadId === newAiChatThreadId;
    const isDirectMessage = store.get(
      aiChatThreadIsDirectMessageFamilySelector.selectorFamily(threadId),
    );
    const isSendingMessageAtom = aiChatIsSendingMessageFamilyState.atomFamily({
      threadId,
    });

    if (isNewChat && store.get(isSendingMessageAtom)) {
      return;
    }

    const newInboxChatRecipients =
      isNewChat && isAiChatInboxEnabled
        ? store.get(aiChatNewThreadRecipientsFamilyState.atomFamily(threadId))
        : undefined;
    const serializedContentToSend =
      store.get(aiChatDraftsByThreadIdState.atom)[threadId] ?? '';
    const draftText = tipTapDocumentToMarkdown(serializedContentToSend).trim();

    if (draftText === '') {
      return;
    }

    const quotedMessageIdAtom = aiChatQuotedMessageIdFamilyState.atomFamily({
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
    const isAssistantMentioned = isAiChatAssistantMentionedInSerializedDocument(
      serializedContentToSend,
    );
    const channelId = isNewChat
      ? store.get(aiChatNewThreadChannelIdState.atom)
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

    if (!canSendAiChatMessage) {
      enqueueToast({
        status: 'error',
        children: t`No AI provider is configured on this instance.`,
      });

      return;
    }

    const directMessageWorkspaceMemberId =
      getAiChatNewThreadDirectMessageWorkspaceMemberId({
        isDirectMessageIdentityEnabled,
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

      if (isDefined(directMessageThreadId)) {
        const isStillOnNewChat =
          store.get(aiChatOpenThreadIdByInstanceIdState.atom)[instanceId] ===
          threadId;

        if (isStillOnNewChat) {
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
        });
      }

      return;
    }

    const aiChatSelectedFiles = store.get(
      aiChatSelectedFilesFamilyState.atomFamily({ threadId }),
    );

    if (!isDirectMessage && aiChatSelectedFiles.length > 0) {
      enqueueToast({
        status: 'error',
        children: t`Wait for the attachments to finish uploading.`,
      });

      return;
    }

    if (isNewChat) {
      onThreadChange(threadId);
    }

    setAiChatDraftsByThreadId((prev) => ({
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
    });
  }, [
    store,
    apolloClient,
    setAiChatDraftsByThreadId,
    canSendAiChatMessage,
    isAiChatInboxEnabled,
    isDirectMessageIdentityEnabled,
    openNewAiChatAsDirectMessage,
    enqueueToast,
    instanceId,
    aiChatThreadId,
    onThreadChange,
    sendToThread,
  ]);

  const handleStop = useCallback(async () => {
    const threadId = aiChatThreadId;

    store.set(
      aiChatIsAwaitingFirstChunkFamilyState.atomFamily({ threadId }),
      false,
    );

    try {
      await apolloClient.mutate({
        mutation: StopAgentChatStreamDocument,
        variables: { threadId },
      });
    } catch (error) {
      enqueueToast(getToastOptionsFromError({ error }));
    }
  }, [store, apolloClient, enqueueToast, aiChatThreadId]);

  return {
    handleSendMessage,
    handleStop,
  };
};
