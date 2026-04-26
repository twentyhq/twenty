import { useMutation } from '@apollo/client/react';
import { CombinedGraphQLErrors } from '@apollo/client/errors';

import { useApplyAgentChatThreadUpdate } from '@/ai/hooks/useApplyAgentChatThreadUpdate';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { ArchiveChatThreadDocument } from '~/generated-metadata/graphql';

export const useArchiveChatThread = () => {
  const { applyAgentChatThreadUpdate } = useApplyAgentChatThreadUpdate();
  const { enqueueErrorSnackBar } = useSnackBar();

  const [archiveMutation] = useMutation(ArchiveChatThreadDocument);

  const archiveChatThread = async (id: string) => {
    try {
      const { data } = await archiveMutation({ variables: { id } });

      if (data?.archiveChatThread) {
        applyAgentChatThreadUpdate({
          id: data.archiveChatThread.id,
          archivedAt: data.archiveChatThread.archivedAt ?? null,
          updatedAt: data.archiveChatThread.updatedAt,
        });
      }
    } catch (error) {
      enqueueErrorSnackBar({
        apolloError: CombinedGraphQLErrors.is(error) ? error : undefined,
      });
    }
  };

  return { archiveChatThread };
};
