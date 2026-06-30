import { CombinedGraphQLErrors } from '@apollo/client/errors';
import { useMutation } from '@apollo/client/react';
import { useStore } from 'jotai';

import {
  AGENT_CHAT_NEW_THREAD_DRAFT_KEY,
  agentChatDraftsByThreadIdState,
} from '@/ai/states/agentChatDraftsByThreadIdState';
import { agentChatInputState } from '@/ai/states/agentChatInputState';
import { agentChatVisibleThreadsSelector } from '@/ai/states/selectors/agentChatVisibleThreadsSelector';
import { currentAiChatThreadState } from '@/ai/states/currentAiChatThreadState';
import { sortChatThreadsByLastActivityDesc } from '@/ai/utils/sortChatThreadsByLastActivityDesc';
import { useUpdateMetadataStoreDraft } from '@/metadata-store/hooks/useUpdateMetadataStoreDraft';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { useSetAtomState } from '@/ui/utilities/state/jotai/hooks/useSetAtomState';
import { DeleteChatThreadDocument } from '~/generated-metadata/graphql';

export const useDeleteChatThread = () => {
  const { removeFromDraft, applyChanges } = useUpdateMetadataStoreDraft();
  const { enqueueErrorSnackBar } = useSnackBar();
  const setCurrentAiChatThread = useSetAtomState(currentAiChatThreadState);
  const setAgentChatInput = useSetAtomState(agentChatInputState);
  const store = useStore();

  const [deleteMutation] = useMutation(DeleteChatThreadDocument);

  const deleteChatThread = async (id: string) => {
    try {
      await deleteMutation({ variables: { id } });

      removeFromDraft({ key: 'agentChatThreads', itemIds: [id] });
      applyChanges();

      const isCurrent = store.get(currentAiChatThreadState.atom) === id;

      if (!isCurrent) {
        return;
      }

      const remaining = sortChatThreadsByLastActivityDesc(
        store
          .get(agentChatVisibleThreadsSelector.atom)
          .filter((thread) => thread.id !== id),
      );
      const draftsByThreadId = store.get(agentChatDraftsByThreadIdState.atom);

      if (remaining.length > 0) {
        const nextThreadId = remaining[0].id;

        setCurrentAiChatThread(nextThreadId);
        setAgentChatInput(draftsByThreadId[nextThreadId] ?? '');
      } else {
        setCurrentAiChatThread(AGENT_CHAT_NEW_THREAD_DRAFT_KEY);
        setAgentChatInput(
          draftsByThreadId[AGENT_CHAT_NEW_THREAD_DRAFT_KEY] ?? '',
        );
      }
    } catch (error) {
      enqueueErrorSnackBar({
        apolloError: CombinedGraphQLErrors.is(error) ? error : undefined,
      });
    }
  };

  return { deleteChatThread };
};
