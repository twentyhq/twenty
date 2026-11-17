import { useApolloClient } from '@apollo/client/react';
import { t } from '@lingui/core/macro';
import { useStore } from 'jotai';
import { useCallback } from 'react';
import { assertIsDefinedOrThrow, isNonEmptyArray } from 'twenty-shared/utils';
import { useToast } from 'twenty-ui/components/feedback';

import { AI_CHAT_NEW_THREAD_DEFAULT_RECIPIENTS } from '@/ai/constants/AiChatNewThreadDefaultRecipients';
import { useLoadAiChatThread } from '@/ai/hooks/useLoadAiChatThread';
import { aiChatDraftsByThreadIdState } from '@/ai/states/aiChatDraftsByThreadIdState';
import { aiChatIsSendingMessageFamilyState } from '@/ai/states/aiChatIsSendingMessageFamilyState';
import { aiChatNewThreadRecipientsFamilyState } from '@/ai/states/aiChatNewThreadRecipientsFamilyState';
import { aiChatSelectedFilesFamilyState } from '@/ai/states/aiChatSelectedFilesFamilyState';
import { aiChatUploadedFilesFamilyState } from '@/ai/states/aiChatUploadedFilesFamilyState';
import { getToastOptionsFromError } from '@/error-handler/utils/getToastOptionsFromError';
import { OpenDirectMessageDocument } from '~/generated-metadata/graphql';

export const useOpenNewAiChatAsDirectMessage = () => {
  const store = useStore();
  const apolloClient = useApolloClient();
  const { enqueueToast } = useToast();
  const { loadAiChatThread } = useLoadAiChatThread();

  const openNewAiChatAsDirectMessage = useCallback(
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
        isNonEmptyArray(
          store.get(
            aiChatSelectedFilesFamilyState.atomFamily({
              threadId: newChatThreadId,
            }),
          ),
        ) ||
        isNonEmptyArray(
          store.get(
            aiChatUploadedFilesFamilyState.atomFamily({
              threadId: newChatThreadId,
            }),
          ),
        )
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

        return directMessageThreadId;
      } catch (error) {
        enqueueToast(getToastOptionsFromError({ error }));
      } finally {
        store.set(isSendingMessageAtom, false);
      }
    },
    [apolloClient, enqueueToast, loadAiChatThread, store],
  );

  return { openNewAiChatAsDirectMessage };
};
