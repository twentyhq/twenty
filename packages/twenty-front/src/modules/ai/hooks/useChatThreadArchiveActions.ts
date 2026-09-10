import { CombinedGraphQLErrors } from '@apollo/client/errors';
import { useMutation } from '@apollo/client/react';

import { useApplyAgentChatThreadUpdate } from '@/ai/hooks/useApplyAgentChatThreadUpdate';
import { useErrorToast } from '@/error-handler/hooks/useErrorToast';
import {
  ArchiveChatThreadDocument,
  UnarchiveChatThreadDocument,
} from '~/generated-metadata/graphql';

export const useChatThreadArchiveActions = () => {
  const { applyAgentChatThreadUpdate } = useApplyAgentChatThreadUpdate();
  const { enqueueErrorToast } = useErrorToast();

  const [archiveMutation] = useMutation(ArchiveChatThreadDocument);
  const [unarchiveMutation] = useMutation(UnarchiveChatThreadDocument);

  const archiveChatThread = async (id: string) => {
    try {
      const { data } = await archiveMutation({ variables: { id } });

      if (data?.archiveChatThread) {
        applyAgentChatThreadUpdate({
          id: data.archiveChatThread.id,
          deletedAt: data.archiveChatThread.deletedAt ?? null,
          updatedAt: data.archiveChatThread.updatedAt,
        });
      }
    } catch (error) {
      enqueueErrorToast(CombinedGraphQLErrors.is(error) ? error : undefined);
    }
  };

  const unarchiveChatThread = async (id: string) => {
    try {
      const { data } = await unarchiveMutation({ variables: { id } });

      if (data?.unarchiveChatThread) {
        applyAgentChatThreadUpdate({
          id: data.unarchiveChatThread.id,
          deletedAt: data.unarchiveChatThread.deletedAt ?? null,
          updatedAt: data.unarchiveChatThread.updatedAt,
        });
      }
    } catch (error) {
      enqueueErrorToast(CombinedGraphQLErrors.is(error) ? error : undefined);
    }
  };

  return { archiveChatThread, unarchiveChatThread };
};
