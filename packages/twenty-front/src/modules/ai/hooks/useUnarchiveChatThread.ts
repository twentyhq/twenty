import { useMutation } from '@apollo/client/react';
import { CombinedGraphQLErrors } from '@apollo/client/errors';

import { useApplyAgentChatThreadUpdate } from '@/ai/hooks/useApplyAgentChatThreadUpdate';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { UnarchiveChatThreadDocument } from '~/generated-metadata/graphql';

export const useUnarchiveChatThread = () => {
  const { applyAgentChatThreadUpdate } = useApplyAgentChatThreadUpdate();
  const { enqueueErrorSnackBar } = useSnackBar();

  const [unarchiveMutation] = useMutation(UnarchiveChatThreadDocument);

  const unarchiveChatThread = async (id: string) => {
    try {
      const { data } = await unarchiveMutation({ variables: { id } });

      if (data?.unarchiveChatThread) {
        applyAgentChatThreadUpdate({
          id: data.unarchiveChatThread.id,
          archivedAt: data.unarchiveChatThread.archivedAt ?? null,
          updatedAt: data.unarchiveChatThread.updatedAt,
        });
      }
    } catch (error) {
      enqueueErrorSnackBar({
        apolloError: CombinedGraphQLErrors.is(error) ? error : undefined,
      });
    }
  };

  return { unarchiveChatThread };
};
