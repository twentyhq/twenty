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

import { INBOX_NEW_THREAD_DEFAULT_RECIPIENTS } from '@/ai/constants/InboxNewThreadDefaultRecipients';
import { INBOX_REFETCH_MESSAGES_EVENT_NAME } from '@/ai/constants/InboxRefetchMessagesEventName';
import { INBOX_RESTORE_EDITOR_CONTENT_EVENT_NAME } from '@/ai/constants/InboxRestoreEditorContentEventName';
import { INBOX_SEND_MESSAGE_EVENT_NAME } from '@/ai/constants/InboxSendMessageEventName';
import { INBOX_STOP_EVENT_NAME } from '@/ai/constants/InboxStopEventName';
import { useAgentChatModelId } from '@/ai/hooks/useAgentChatModelId';
import { useAttachChatThreadToRecord } from '@/ai/hooks/useAttachChatThreadToRecord';
import { useCanSendInboxMessage } from '@/ai/hooks/useCanSendInboxMessage';
import { useGetBrowsingContext } from '@/ai/hooks/useGetBrowsingContext';
import { useOpenNewInboxAsDirectMessage } from '@/ai/hooks/useOpenNewInboxAsDirectMessage';
import { useOptimisticallyRestoreOnSend } from '@/ai/hooks/useOptimisticallyRestoreOnSend';
import { useProjectInboxThreadToUrl } from '@/ai/hooks/useProjectInboxThreadToUrl';
import { useRefreshInboxThreadPermissions } from '@/ai/hooks/useRefreshInboxThreadPermissions';
import { useWarnAboutParticipantMentionsNotAdded } from '@/ai/hooks/useWarnAboutParticipantMentionsNotAdded';
import { inboxDraftsByThreadIdState } from '@/ai/states/inboxDraftsByThreadIdState';
import { inboxQuotedMessageIdFamilyState } from '@/ai/states/inboxQuotedMessageIdFamilyState';
import { inboxMessageAuthorLookupSelector } from '@/ai/states/selectors/inboxMessageAuthorLookupSelector';
import { inboxThreadMessageFamilySelector } from '@/ai/states/selectors/inboxThreadMessageFamilySelector';
import { getInboxMessageAuthor } from '@/ai/utils/getInboxMessageAuthor';
import { getInboxMessageQuoteSource } from '@/ai/utils/getInboxMessageQuoteSource';
import { prependInboxQuoteToText } from '@/ai/utils/prependInboxQuoteToText';
import { agentChatLastSentBrowsingContextFamilyState } from '@/ai/states/agentChatLastSentBrowsingContextFamilyState';
import { inboxSelectedFilesState } from '@/ai/states/inboxSelectedFilesState';
import { agentChatSentMessageHandOffState } from '@/ai/states/agentChatSentMessageHandOffState';
import { inboxUploadedFilesState } from '@/ai/states/inboxUploadedFilesState';
import { agentChatUnconfirmedFirstMessageFamilyState } from '@/ai/states/agentChatUnconfirmedFirstMessageFamilyState';
import { currentInboxThreadState } from '@/ai/states/currentInboxThreadState';
import { inboxThreadIsDirectMessageFamilySelector } from '@/ai/states/selectors/inboxThreadIsDirectMessageFamilySelector';
import { agentChatErrorFamilyState } from '@/ai/states/agentChatErrorFamilyState';
import { agentChatIsAwaitingFirstChunkFamilyState } from '@/ai/states/agentChatIsAwaitingFirstChunkFamilyState';
import { agentChatIsAwaitingPersistedRefetchFamilyState } from '@/ai/states/agentChatIsAwaitingPersistedRefetchFamilyState';
import { inboxIsSendingMessageFamilyState } from '@/ai/states/inboxIsSendingMessageFamilyState';
import { inboxMessagesFamilyState } from '@/ai/states/inboxMessagesFamilyState';
import { inboxNewThreadChannelIdState } from '@/ai/states/inboxNewThreadChannelIdState';
import { inboxNewThreadRecipientsFamilyState } from '@/ai/states/inboxNewThreadRecipientsFamilyState';
import { newInboxThreadIdState } from '@/ai/states/newInboxThreadIdState';
import { type InboxNewThreadRecipients } from '@/ai/types/InboxNewThreadRecipients';
import { type InboxParticipantMention } from '@/ai/types/InboxParticipantMention';
import { getConversationTargetsFromSerializedDocument } from '@/ai/utils/getConversationTargetsFromSerializedDocument';
import { getInboxInitialRecipients } from '@/ai/utils/getInboxInitialRecipients';
import { getInboxNewThreadDirectMessageWorkspaceMemberId } from '@/ai/utils/getInboxNewThreadDirectMessageWorkspaceMemberId';
import { getParticipantMentionsFromSerializedDocument } from '@/ai/utils/getParticipantMentionsFromSerializedDocument';
import { isAgentChatAssistantMentionedInSerializedDocument } from '@/ai/utils/isAgentChatAssistantMentionedInSerializedDocument';
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

type InboxMessageToSend = {
  threadId: string;
  isNewChat: boolean;
  isDirectMessage: boolean;
  newInboxChatRecipients: InboxNewThreadRecipients | undefined;
  serializedContentToSend: string;
  contentToSend: string;
  participantMentions: InboxParticipantMention[];
  initialRecipients: InboxParticipantMention[];
  isAssistantMentioned: boolean;
  channelId: string | null | undefined;
  quotedMessageId: string | null;
};

export const useAgentChat = () => {
  const { modelIdForRequest } = useAgentChatModelId();
  const aiModels = useAtomStateValue(aiModelsState);
  const canSendInboxMessage = useCanSendInboxMessage();
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
  const setCurrentInboxThread = useSetAtomState(currentInboxThreadState);
  const { projectInboxThreadToUrl } = useProjectInboxThreadToUrl({
    shouldPreserveClosedInbox: true,
  });
  const { refreshInboxThreadPermissions } = useRefreshInboxThreadPermissions();
  const store = useStore();

  const setInboxUploadedFiles = useSetAtomState(inboxUploadedFilesState);

  const setInboxDraftsByThreadId = useSetAtomState(inboxDraftsByThreadIdState);

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
    }: InboxMessageToSend) => {
      const isSendingMessageAtom = inboxIsSendingMessageFamilyState.atomFamily({
        threadId,
      });
      const inboxUploadedFiles = isDirectMessage
        ? []
        : store.get(inboxUploadedFilesState.atom);
      const browsingContext = getBrowsingContext();
      const lastSentBrowsingContextAtom =
        agentChatLastSentBrowsingContextFamilyState.atomFamily(threadId);
      const lastSentBrowsingContext = store.get(lastSentBrowsingContextAtom);
      const isBrowsingContextChanged = isUndefined(lastSentBrowsingContext)
        ? isDefined(browsingContext)
        : JSON.stringify(browsingContext) !==
          JSON.stringify(lastSentBrowsingContext);
      const browsingContextToSend = isBrowsingContextChanged
        ? browsingContext
        : null;
      const fileIds = inboxUploadedFiles.map(({ fileId }) => fileId);
      const unconfirmedFirstMessageAtom =
        agentChatUnconfirmedFirstMessageFamilyState.atomFamily(threadId);
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
          ...inboxUploadedFiles,
        ],
        metadata: {
          createdAt: optimisticMessageCreatedAt,
          senderWorkspaceMemberId: store.get(currentWorkspaceMemberState.atom)
            ?.id,
        },
        status: 'sent',
      };

      const messagesAtom = inboxMessagesFamilyState.atomFamily({
        threadId,
      });
      const errorAtom = agentChatErrorFamilyState.atomFamily({ threadId });
      const isAwaitingFirstChunkAtom =
        agentChatIsAwaitingFirstChunkFamilyState.atomFamily({ threadId });
      const removeOptimisticUserMessage = () => {
        store.set(messagesAtom, (messages) =>
          messages.filter((message) => message.id !== messageId),
        );
        store.set(isAwaitingFirstChunkAtom, false);
      };

      store.set(agentChatSentMessageHandOffState.atom, (sentMessageHandOff) =>
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

      const fileAttachments = inboxUploadedFiles.map((file) => ({
        id: file.fileId,
        filename: file.filename,
      }));

      if (!isDirectMessage) {
        setInboxUploadedFiles([]);
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
            agentChatIsAwaitingPersistedRefetchFamilyState.atomFamily({
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
          await refreshInboxThreadPermissions([threadId]);
          store.set(newInboxThreadIdState.atom, v4());
          store.set(inboxNewThreadChannelIdState.atom, null);
          store.set(unconfirmedFirstMessageAtom, null);

          if (isDefined(newInboxChatRecipients)) {
            store.set(
              inboxNewThreadRecipientsFamilyState.atomFamily(threadId),
              INBOX_NEW_THREAD_DEFAULT_RECIPIENTS,
            );
          }

          if (store.get(currentInboxThreadState.atom) === threadId) {
            projectInboxThreadToUrl(threadId);
          }
        }

        dispatchBrowserEvent(INBOX_REFETCH_MESSAGES_EVENT_NAME);
      } catch (error) {
        rollbackOptimisticRestore();

        if (isNewChat) {
          store.set(unconfirmedFirstMessageAtom, {
            messageId,
            text: contentToSend,
            fileIds,
          });
        }

        setInboxDraftsByThreadId((prev) => ({
          ...prev,
          [threadId]: serializedContentToSend,
        }));
        setInboxUploadedFiles((currentUploadedFiles) => [
          ...inboxUploadedFiles,
          ...currentUploadedFiles,
        ]);

        const quotedMessageIdAtom = inboxQuotedMessageIdFamilyState.atomFamily({
          threadId,
        });

        if (!isDefined(store.get(quotedMessageIdAtom))) {
          store.set(quotedMessageIdAtom, quotedMessageId);
        }

        removeOptimisticUserMessage();
        store.set(errorAtom, toAiChatError(error));

        if (isAiChatCreditsExhaustedError(error)) {
          store.set(currentWorkspaceState.atom, markWorkspaceCreditsExhausted);
        }

        if (store.get(currentInboxThreadState.atom) === threadId) {
          dispatchBrowserEvent(INBOX_RESTORE_EDITOR_CONTENT_EVENT_NAME, {
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
      setInboxUploadedFiles,
      setInboxDraftsByThreadId,
      modelIdForRequest,
      aiModels,
      projectInboxThreadToUrl,
      refreshInboxThreadPermissions,
      apolloClient,
      applyOptimisticRestore,
      attachChatThreadToRecord,
      warnAboutParticipantMentionsNotAdded,
    ],
  );

  const handleSendMessage = useCallback(async () => {
    const newInboxThreadId = store.get(newInboxThreadIdState.atom);
    const threadId =
      store.get(currentInboxThreadState.atom) ?? newInboxThreadId;
    const isNewChat = threadId === newInboxThreadId;
    const isDirectMessage = store.get(
      inboxThreadIsDirectMessageFamilySelector.selectorFamily(threadId),
    );
    const isSendingMessageAtom = inboxIsSendingMessageFamilyState.atomFamily({
      threadId,
    });

    if (isNewChat && store.get(isSendingMessageAtom)) {
      return;
    }

    const newInboxChatRecipients =
      isNewChat && isAiChatInboxEnabled
        ? store.get(inboxNewThreadRecipientsFamilyState.atomFamily(threadId))
        : undefined;
    const serializedContentToSend =
      store.get(inboxDraftsByThreadIdState.atom)[threadId] ?? '';
    const draftText = tipTapDocumentToMarkdown(serializedContentToSend).trim();

    if (draftText === '') {
      return;
    }

    const quotedMessageIdAtom = inboxQuotedMessageIdFamilyState.atomFamily({
      threadId,
    });
    const quotedMessageId = store.get(quotedMessageIdAtom);
    const quotedMessage = store.get(
      inboxThreadMessageFamilySelector.selectorFamily({
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
      ? getInboxMessageQuoteSource({
          message: quotedMessage,
          author: getInboxMessageAuthor({
            message: quotedMessage,
            authorLookup: store.get(inboxMessageAuthorLookupSelector.atom),
            agentName: quotedAgentName,
          }),
        })
      : null;
    const contentToSend = isDefined(quotedMessageSource)
      ? prependInboxQuoteToText({
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
      isAgentChatAssistantMentionedInSerializedDocument(
        serializedContentToSend,
      );
    const channelId = isNewChat
      ? store.get(inboxNewThreadChannelIdState.atom)
      : undefined;
    const initialRecipients = getInboxInitialRecipients({
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

    if (!canSendInboxMessage) {
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

    const inboxSelectedFiles = store.get(inboxSelectedFilesState.atom);

    if (!isDirectMessage && inboxSelectedFiles.length > 0) {
      enqueueToast({
        status: 'error',
        children: t`Wait for the attachments to finish uploading.`,
      });

      return;
    }

    setCurrentInboxThread(threadId);

    setInboxDraftsByThreadId((prev) => ({
      ...prev,
      [threadId]: '',
    }));
    store.set(quotedMessageIdAtom, null);

    dispatchBrowserEvent(INBOX_RESTORE_EDITOR_CONTENT_EVENT_NAME, {
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
    setInboxDraftsByThreadId,
    canSendInboxMessage,
    isAiChatInboxEnabled,
    isDirectMessageIdentityEnabled,
    openNewInboxAsDirectMessage,
    enqueueToast,
    setCurrentInboxThread,
    sendToThread,
  ]);

  useListenToBrowserEvent({
    eventName: INBOX_SEND_MESSAGE_EVENT_NAME,
    onBrowserEvent: handleSendMessage,
  });

  const handleStop = useCallback(async () => {
    const threadId = store.get(currentInboxThreadState.atom);

    if (!isDefined(threadId)) {
      return;
    }

    store.set(
      agentChatIsAwaitingFirstChunkFamilyState.atomFamily({ threadId }),
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
    eventName: INBOX_STOP_EVENT_NAME,
    onBrowserEvent: handleStop,
  });

  return {
    handleSendMessage,
    handleStop,
  };
};
