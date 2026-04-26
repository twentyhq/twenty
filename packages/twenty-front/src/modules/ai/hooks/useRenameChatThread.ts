import { useMutation } from '@apollo/client/react';
import { CombinedGraphQLErrors } from '@apollo/client/errors';

import { useApplyAgentChatThreadUpdate } from '@/ai/hooks/useApplyAgentChatThreadUpdate';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { RenameChatThreadDocument } from '~/generated-metadata/graphql';

export const useRenameChatThread = () => {
  const { applyAgentChatThreadUpdate } = useApplyAgentChatThreadUpdate();
  const { enqueueErrorSnackBar } = useSnackBar();

  const [renameChatThreadMutation] = useMutation(RenameChatThreadDocument);

  const renameChatThread = async (id: string, title: string) => {
    try {
      const { data } = await renameChatThreadMutation({
        variables: { id, title },
      });

      if (data?.renameChatThread) {
        applyAgentChatThreadUpdate({
          id: data.renameChatThread.id,
          title: data.renameChatThread.title ?? null,
          updatedAt: data.renameChatThread.updatedAt,
        });
      }
    } catch (error) {
      enqueueErrorSnackBar({
        apolloError: CombinedGraphQLErrors.is(error) ? error : undefined,
      });
    }
  };

  return { renameChatThread };
};
