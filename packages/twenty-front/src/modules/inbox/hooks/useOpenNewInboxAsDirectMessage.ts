import { useApolloClient } from '@apollo/client/react';
import { t } from '@lingui/core/macro';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { assertIsDefinedOrThrow, isNonEmptyArray } from 'twenty-shared/utils';
import { useToast } from 'twenty-ui/components/feedback';

import { AI_CHAT_NEW_THREAD_DEFAULT_RECIPIENTS } from '@/ai/constants/AiChatNewThreadDefaultRecipients';
import { useLoadAiChatThread } from '@/ai/hooks/useLoadAiChatThread';
import { useProjectAiChatThreadToUrl } from '@/ai/hooks/useProjectAiChatThreadToUrl';
import { aiChatDraftsByThreadIdState } from '@/ai/states/aiChatDraftsByThreadIdState';
import { aiChatIsSendingMessageFamilyState } from '@/ai/states/aiChatIsSendingMessageFamilyState';
import { aiChatNewThreadRecipientsFamilyState } from '@/ai/states/aiChatNewThreadRecipientsFamilyState';
import { aiChatSelectedFilesState } from '@/ai/states/aiChatSelectedFilesState';
import { aiChatUploadedFilesState } from '@/ai/states/aiChatUploadedFilesState';
import { currentAiChatThreadState } from '@/ai/states/currentAiChatThreadState';
import { newAiChatThreadIdState } from '@/ai/states/newAiChatThreadIdState';
import { getToastOptionsFromError } from '@/error-handler/utils/getToastOptionsFromError';
import { OpenDirectMessageDocument } from '~/generated-metadata/graphql';

export const useOpenNewInboxAsDirectMessage = () => {
  const store = useStore();
  const apolloClient = useApolloClient();
  const { enqueueToast } = useToast();
  const { loadAiChatThread } = useLoadAiChatThread();
  const { projectAiChatThreadToUrl } = useProjectAiChatThreadToUrl({
    shouldPreserveClosedInbox: true,
  });

  const openNewInboxAsDirectMessage = useCallback(
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
        isNonEmptyArray(store.get(aiChatSelectedFilesState.atom)) ||
        isNonEmptyArray(store.get(aiChatUploadedFilesState.atom))
      ) {
        enqueueToast({
          status: 'error',
          children: t`Direct messages don't support attachments.`,
        });

        return;
      }

      const isSendingMessageAtom = aiChatIsSendingMessageFamilyState.atomFamily(
        {
          threadId: newChatThreadId,
        },
      );

      store.set(isSendingMessageAtom, true);

      try {
        const { data } = await apolloClient.mutate({
          mutation: OpenDirectMessageDocument,
          variables: { workspaceMemberId },
        });
        const directMessageThreadId = data?.openDirectMessage;
        assertIsDefinedOrThrow(directMessageThreadId);
        const directMessageThread = await loadAiChatThread(
          directMessageThreadId,
        );
        assertIsDefinedOrThrow(directMessageThread);

        if (
          store.get(aiChatDraftsByThreadIdState.atom)[newChatThreadId] ===
          serializedDraft
        ) {
          store.set(aiChatDraftsByThreadIdState.atom, (drafts) => ({
            ...drafts,
            [newChatThreadId]: '',
          }));
          store.set(
            aiChatNewThreadRecipientsFamilyState.atomFamily(newChatThreadId),
            AI_CHAT_NEW_THREAD_DEFAULT_RECIPIENTS,
          );
        }

        if (
          (store.get(currentAiChatThreadState.atom) ??
            store.get(newAiChatThreadIdState.atom)) === newChatThreadId
        ) {
          store.set(currentAiChatThreadState.atom, directMessageThreadId);
          projectAiChatThreadToUrl(directMessageThreadId);
        }

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
      loadAiChatThread,
      projectAiChatThreadToUrl,
      store,
    ],
  );

  return { openNewInboxAsDirectMessage };
};
