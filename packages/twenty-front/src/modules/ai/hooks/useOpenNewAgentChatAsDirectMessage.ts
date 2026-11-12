import { useApolloClient } from '@apollo/client/react';
import { t } from '@lingui/core/macro';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { assertIsDefinedOrThrow, isNonEmptyArray } from 'twenty-shared/utils';
import { useToast } from 'twenty-ui/components/feedback';

import { AGENT_CHAT_NEW_THREAD_DEFAULT_RECIPIENTS } from '@/ai/constants/AgentChatNewThreadDefaultRecipients';
import { useLoadAgentChatThread } from '@/ai/hooks/useLoadAgentChatThread';
import { useProjectAiChatThreadToUrl } from '@/ai/hooks/useProjectAiChatThreadToUrl';
import { agentChatDraftsByThreadIdState } from '@/ai/states/agentChatDraftsByThreadIdState';
import { agentChatIsSendingMessageFamilyState } from '@/ai/states/agentChatIsSendingMessageFamilyState';
import { agentChatNewThreadRecipientsFamilyState } from '@/ai/states/agentChatNewThreadRecipientsFamilyState';
import { agentChatSelectedFilesState } from '@/ai/states/agentChatSelectedFilesState';
import { agentChatUploadedFilesState } from '@/ai/states/agentChatUploadedFilesState';
import { currentAiChatThreadState } from '@/ai/states/currentAiChatThreadState';
import { getToastOptionsFromError } from '@/error-handler/utils/getToastOptionsFromError';
import { OpenDirectMessageDocument } from '~/generated-metadata/graphql';

export const useOpenNewAgentChatAsDirectMessage = () => {
  const store = useStore();
  const apolloClient = useApolloClient();
  const { enqueueToast } = useToast();
  const { loadAgentChatThread } = useLoadAgentChatThread();
  const { projectAiChatThreadToUrl } = useProjectAiChatThreadToUrl({
    shouldPreserveClosedInbox: true,
  });

  const openNewAgentChatAsDirectMessage = useCallback(
    async ({
      newChatThreadId,
      workspaceMemberId,
      serializedDraft,
    }: {
      newChatThreadId: string;
      workspaceMemberId: string;
      serializedDraft: string;
    }) => {
      if (
        isNonEmptyArray(store.get(agentChatSelectedFilesState.atom)) ||
        isNonEmptyArray(store.get(agentChatUploadedFilesState.atom))
      ) {
        enqueueToast({
          status: 'error',
          children: t`Direct messages don't support attachments.`,
        });

        return;
      }

      const isSendingMessageAtom =
        agentChatIsSendingMessageFamilyState.atomFamily({
          threadId: newChatThreadId,
        });

      store.set(isSendingMessageAtom, true);

      try {
        const { data } = await apolloClient.mutate({
          mutation: OpenDirectMessageDocument,
          variables: { workspaceMemberId },
        });
        const directMessageThreadId = data?.openDirectMessage;
        assertIsDefinedOrThrow(directMessageThreadId);
        const directMessageThread = await loadAgentChatThread(
          directMessageThreadId,
        );
        assertIsDefinedOrThrow(directMessageThread);

        store.set(agentChatDraftsByThreadIdState.atom, (drafts) => ({
          ...drafts,
          [newChatThreadId]:
            drafts[newChatThreadId] === serializedDraft
              ? ''
              : drafts[newChatThreadId],
        }));
        store.set(
          agentChatNewThreadRecipientsFamilyState.atomFamily(newChatThreadId),
          AGENT_CHAT_NEW_THREAD_DEFAULT_RECIPIENTS,
        );
        store.set(currentAiChatThreadState.atom, directMessageThreadId);
        projectAiChatThreadToUrl(directMessageThreadId);

        return directMessageThreadId;
      } catch (error) {
        enqueueToast(getToastOptionsFromError({ error }));
      } finally {
        store.set(isSendingMessageAtom, false);
      }
    },
    [
      apolloClient,
      enqueueToast,
      loadAgentChatThread,
      projectAiChatThreadToUrl,
      store,
    ],
  );

  return { openNewAgentChatAsDirectMessage };
};
