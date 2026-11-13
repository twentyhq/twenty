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

import { AI_CHAT_NEW_THREAD_DEFAULT_RECIPIENTS } from '@/ai/constants/AgentChatNewThreadDefaultRecipients';
import { AI_CHAT_REFETCH_MESSAGES_EVENT_NAME } from '@/ai/constants/AgentChatRefetchMessagesEventName';
import { AI_CHAT_RESTORE_EDITOR_CONTENT_EVENT_NAME } from '@/ai/constants/AgentChatRestoreEditorContentEventName';
import { AI_CHAT_SEND_MESSAGE_EVENT_NAME } from '@/ai/constants/AgentChatSendMessageEventName';
import { AI_CHAT_STOP_EVENT_NAME } from '@/ai/constants/AgentChatStopEventName';
import { useAiChatModelId } from '@/ai/hooks/useAgentChatModelId';
import { useAttachChatThreadToRecord } from '@/ai/hooks/useAttachChatThreadToRecord';
import { useCanSendAiChatMessage } from '@/ai/hooks/useCanSendAgentChatMessage';
import { useGetBrowsingContext } from '@/ai/hooks/useGetBrowsingContext';
import { useOpenNewInboxAsDirectMessage } from '@/ai/hooks/useOpenNewAgentChatAsDirectMessage';
import { useOptimisticallyRestoreOnSend } from '@/ai/hooks/useOptimisticallyRestoreOnSend';
import { useProjectAiChatThreadToUrl } from '@/ai/hooks/useProjectAiChatThreadToUrl';
import { useRefreshAiChatThreadPermissions } from '@/ai/hooks/useRefreshAgentChatThreadPermissions';
import { useWarnAboutParticipantMentionsNotAdded } from '@/ai/hooks/useWarnAboutParticipantMentionsNotAdded';
import { aiChatDraftsByThreadIdState } from '@/ai/states/agentChatDraftsByThreadIdState';
import { aiChatQuotedMessageIdFamilyState } from '@/ai/states/agentChatQuotedMessageIdFamilyState';
import { aiChatMessageAuthorLookupSelector } from '@/ai/states/selectors/agentChatMessageAuthorLookupSelector';
import { aiChatThreadMessageFamilySelector } from '@/ai/states/selectors/agentChatThreadMessageFamilySelector';
import { getAiChatMessageAuthor } from '@/ai/utils/getAgentChatMessageAuthor';
import { getAiChatMessageQuoteSource } from '@/ai/utils/getAgentChatMessageQuoteSource';
import { prependAiChatQuoteToText } from '@/ai/utils/prependAgentChatQuoteToText';
import { aiChatLastSentBrowsingContextFamilyState } from '@/ai/states/agentChatLastSentBrowsingContextFamilyState';
import { aiChatSelectedFilesState } from '@/ai/states/agentChatSelectedFilesState';
import { aiChatSentMessageHandOffState } from '@/ai/states/agentChatSentMessageHandOffState';
import { aiChatUploadedFilesState } from '@/ai/states/agentChatUploadedFilesState';
import { aiChatUnconfirmedFirstMessageFamilyState } from '@/ai/states/agentChatUnconfirmedFirstMessageFamilyState';
import { currentAiChatThreadState } from '@/ai/states/currentAiChatThreadState';
import { inboxThreadIsDirectMessageFamilySelector } from '@/ai/states/selectors/agentChatThreadIsDirectMessageFamilySelector';
import { aiChatErrorFamilyState } from '@/ai/states/agentChatErrorFamilyState';
import { aiChatIsAwaitingFirstChunkFamilyState } from '@/ai/states/agentChatIsAwaitingFirstChunkFamilyState';
import { aiChatIsAwaitingPersistedRefetchFamilyState } from '@/ai/states/agentChatIsAwaitingPersistedRefetchFamilyState';
import { aiChatIsSendingMessageFamilyState } from '@/ai/states/agentChatIsSendingMessageFamilyState';
import { aiChatMessagesFamilyState } from '@/ai/states/agentChatMessagesFamilyState';
import { inboxNewThreadChannelIdState } from '@/ai/states/agentChatNewThreadChannelIdState';
import { aiChatNewThreadRecipientsFamilyState } from '@/ai/states/agentChatNewThreadRecipientsFamilyState';
import { newAiChatThreadIdState } from '@/ai/states/newAiChatThreadIdState';
import { type AiChatNewThreadRecipients } from '@/ai/types/AgentChatNewThreadRecipients';
import { type AiChatParticipantMention } from '@/ai/types/AgentChatParticipantMention';
import { getConversationTargetsFromSerializedDocument } from '@/ai/utils/getConversationTargetsFromSerializedDocument';
import { getAiChatInitialRecipients } from '@/ai/utils/getAgentChatInitialRecipients';
import { getInboxNewThreadDirectMessageWorkspaceMemberId } from '@/ai/utils/getAgentChatNewThreadDirectMessageWorkspaceMemberId';
import { getParticipantMentionsFromSerializedDocument } from '@/ai/utils/getParticipantMentionsFromSerializedDocument';
import { isAiChatAssistantMentionedInSerializedDocument } from '@/ai/utils/isAgentChatAssistantMentionedInSerializedDocument';
import { isAiChatCreditsExhaustedError } from '@/ai/utils/isAiChatCreditsExhaustedError';
import { toAiChatError } from '@/ai/utils/toAiChatError';
import { currentWorkspaceState } from '@/auth/states/currentWorkspaceState';
import { useListenToBrowserEvent } from '@/browser-event/hooks/useListenToBrowserEvent';
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
  const { modelIdForRequest } = useAiChatModelId();
  const aiModels = useAtomStateValue(aiModelsState);
  const canSendAiChatMessage = useCanSendAiChatMessage();
  const isAiChatInboxEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_AI_CHAT_INBOX_ENABLED,
  );
  const isDirectMessageIdentityEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_AGENT_CHAT_DIRECT_MESSAGE_IDENTITY_ENABLED,
  );
  const { openNewInboxAsDirectMessage } = useOpenNewInboxAsDirectMessage();
  const { getBrowsingContext } = useGetBrowsingContext();
  const { applyOptimisticRestore } = useOptimisticallyRestoreOnSend();
  const { attachChatThreadToRecord } = useAttachChatThreadToRecord();
  const { warnAboutParticipantMentionsNotAdded } =
    useWarnAboutParticipantMentionsNotAdded();
  const apolloClient = useApolloClient();
  const { enqueueToast } = useToast();
  const setCurrentAiChatThread = useSetAtomState(currentAiChatThreadState);
  const { projectAiChatThreadToUrl } = useProjectAiChatThreadToUrl({
    shouldPreserveClosedInbox: true,
  });
  const { refreshAiChatThreadPermissions } =
    useRefreshAiChatThreadPermissions();
  const store = useStore();

  const setAiChatUploadedFiles = useSetAtomState(aiChatUploadedFilesState);

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
      const aiChatUploadedFiles = isDirectMessage
        ? []
        : store.get(aiChatUploadedFilesState.atom);
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
        setAiChatUploadedFiles([]);
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
          store.set(inboxNewThreadChannelIdState.atom, null);
          store.set(unconfirmedFirstMessageAtom, null);

          if (isDefined(newInboxChatRecipients)) {
            store.set(
              aiChatNewThreadRecipientsFamilyState.atomFamily(threadId),
              AI_CHAT_NEW_THREAD_DEFAULT_RECIPIENTS,
            );
          }

          if (store.get(currentAiChatThreadState.atom) === threadId) {
            projectAiChatThreadToUrl(threadId);
          }
        }

        dispatchBrowserEvent(AI_CHAT_REFETCH_MESSAGES_EVENT_NAME);
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
        setAiChatUploadedFiles((currentUploadedFiles) => [
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

        if (store.get(currentAiChatThreadState.atom) === threadId) {
          dispatchBrowserEvent(AI_CHAT_RESTORE_EDITOR_CONTENT_EVENT_NAME, {
            content: serializedContentToSend,
          });
        }
      } finally {
        store.set(isSendingMessageAtom, false);
      }
    },
    [
      store,
      getBrowsingContext,
      setAiChatUploadedFiles,
      setAiChatDraftsByThreadId,
      modelIdForRequest,
      aiModels,
      projectAiChatThreadToUrl,
      refreshAiChatThreadPermissions,
      apolloClient,
      applyOptimisticRestore,
      attachChatThreadToRecord,
      warnAboutParticipantMentionsNotAdded,
    ],
  );

  const handleSendMessage = useCallback(async () => {
    const newAiChatThreadId = store.get(newAiChatThreadIdState.atom);
    const threadId =
      store.get(currentAiChatThreadState.atom) ?? newAiChatThreadId;
    const isNewChat = threadId === newAiChatThreadId;
    const isDirectMessage = store.get(
      inboxThreadIsDirectMessageFamilySelector.selectorFamily(threadId),
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
      ? store.get(inboxNewThreadChannelIdState.atom)
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
      getInboxNewThreadDirectMessageWorkspaceMemberId({
        isDirectMessageIdentityEnabled,
        newInboxChatRecipients,
        isAssistantMentioned,
        channelId,
        initialRecipients,
        participantMentions,
      });

    if (isDefined(directMessageWorkspaceMemberId)) {
      const directMessageThreadId = await openNewInboxAsDirectMessage({
        newChatThreadId: threadId,
        workspaceMemberId: directMessageWorkspaceMemberId,
        serializedDraft: serializedContentToSend,
      });

      if (isDefined(directMessageThreadId)) {
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

    const aiChatSelectedFiles = store.get(aiChatSelectedFilesState.atom);

    if (!isDirectMessage && aiChatSelectedFiles.length > 0) {
      enqueueToast({
        status: 'error',
        children: t`Wait for the attachments to finish uploading.`,
      });

      return;
    }

    setCurrentAiChatThread(threadId);

    setAiChatDraftsByThreadId((prev) => ({
      ...prev,
      [threadId]: '',
    }));
    store.set(quotedMessageIdAtom, null);

    dispatchBrowserEvent(AI_CHAT_RESTORE_EDITOR_CONTENT_EVENT_NAME, {
      content: '',
    });

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
    openNewInboxAsDirectMessage,
    enqueueToast,
    setCurrentAiChatThread,
    sendToThread,
  ]);

  useListenToBrowserEvent({
    eventName: AI_CHAT_SEND_MESSAGE_EVENT_NAME,
    onBrowserEvent: handleSendMessage,
  });

  const handleStop = useCallback(async () => {
    const threadId = store.get(currentAiChatThreadState.atom);

    if (!isDefined(threadId)) {
      return;
    }

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
  }, [store, apolloClient, enqueueToast]);

  useListenToBrowserEvent({
    eventName: AI_CHAT_STOP_EVENT_NAME,
    onBrowserEvent: handleStop,
  });

  return {
    handleSendMessage,
    handleStop,
  };
};
