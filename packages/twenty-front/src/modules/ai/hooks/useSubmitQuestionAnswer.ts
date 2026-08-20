import { CombinedGraphQLErrors } from '@apollo/client/errors';
import { useApolloClient } from '@apollo/client/react';
import { t } from '@lingui/core/macro';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { type AskQuestionAnswer } from 'twenty-shared/ai';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';

import { AGENT_CHAT_INSTANCE_ID } from '@/ai/constants/AgentChatInstanceId';
import { AGENT_CHAT_REFETCH_MESSAGES_EVENT_NAME } from '@/ai/constants/AgentChatRefetchMessagesEventName';
import { ANSWER_AGENT_CHAT_QUESTION } from '@/ai/graphql/mutations/answerAgentChatQuestion';
import { useAgentChatModelId } from '@/ai/hooks/useAgentChatModelId';
import { agentChatDisplayedThreadState } from '@/ai/states/agentChatDisplayedThreadState';
import { agentChatIsAwaitingFirstChunkComponentFamilyState } from '@/ai/states/agentChatIsAwaitingFirstChunkComponentFamilyState';
import { agentChatMessagesComponentFamilyState } from '@/ai/states/agentChatMessagesComponentFamilyState';
import { agentChatSelectedFilesState } from '@/ai/states/agentChatSelectedFilesState';
import { agentChatUploadedFilesState } from '@/ai/states/agentChatUploadedFilesState';
import { markQuestionAnswered } from '@/ai/utils/markQuestionAnswered';
import { markQuestionPending } from '@/ai/utils/markQuestionPending';
import { dispatchBrowserEvent } from '@/browser-event/utils/dispatchBrowserEvent';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';

export const useSubmitQuestionAnswer = () => {
  const apolloClient = useApolloClient();
  const store = useStore();
  const { enqueueErrorSnackBar, enqueueInfoSnackBar } = useSnackBar();
  const { modelIdForRequest } = useAgentChatModelId();

  const submitAnswer = useCallback(
    async ({
      messageId,
      toolCallId,
      answers,
    }: {
      messageId: string;
      toolCallId: string;
      answers: AskQuestionAnswer[];
    }) => {
      const threadId = store.get(agentChatDisplayedThreadState.atom);

      if (!isDefined(threadId)) {
        return;
      }

      const agentChatSelectedFiles = store.get(
        agentChatSelectedFilesState.atom,
      );

      if (isNonEmptyArray(agentChatSelectedFiles)) {
        enqueueInfoSnackBar({
          message: t`Wait for files to finish uploading before answering.`,
        });

        return;
      }

      const messagesAtom = agentChatMessagesComponentFamilyState.atomFamily({
        instanceId: AGENT_CHAT_INSTANCE_ID,
        familyKey: { threadId },
      });
      const isAwaitingFirstChunkAtom =
        agentChatIsAwaitingFirstChunkComponentFamilyState.atomFamily({
          instanceId: AGENT_CHAT_INSTANCE_ID,
          familyKey: { threadId },
        });
      const previousMessages = store.get(messagesAtom);

      const uploadedFiles = store.get(agentChatUploadedFilesState.atom);
      const fileAttachments = uploadedFiles.map((file) => ({
        id: file.fileId,
        filename: file.filename,
      }));

      store.set(
        messagesAtom,
        markQuestionAnswered(previousMessages, messageId, toolCallId, answers),
      );
      store.set(isAwaitingFirstChunkAtom, true);
      store.set(agentChatUploadedFilesState.atom, []);

      try {
        await apolloClient.mutate({
          mutation: ANSWER_AGENT_CHAT_QUESTION,
          variables: {
            threadId,
            messageId,
            answers,
            modelId: modelIdForRequest,
            fileAttachments: isNonEmptyArray(fileAttachments)
              ? fileAttachments
              : undefined,
          },
        });

        dispatchBrowserEvent(AGENT_CHAT_REFETCH_MESSAGES_EVENT_NAME);
      } catch (error) {
        const currentMessages = store.get(messagesAtom);

        store.set(isAwaitingFirstChunkAtom, false);
        store.set(
          messagesAtom,
          markQuestionPending(currentMessages, messageId, toolCallId),
        );
        store.set(agentChatUploadedFilesState.atom, (currentUploadedFiles) => [
          ...uploadedFiles,
          ...currentUploadedFiles,
        ]);

        enqueueErrorSnackBar({
          apolloError: CombinedGraphQLErrors.is(error) ? error : undefined,
        });
      }
    },
    [
      apolloClient,
      store,
      enqueueErrorSnackBar,
      enqueueInfoSnackBar,
      modelIdForRequest,
    ],
  );

  return { submitAnswer };
};
