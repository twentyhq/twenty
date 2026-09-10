import { CombinedGraphQLErrors } from '@apollo/client/errors';
import { useMutation } from '@apollo/client/react';

import { useApplyAgentChatThreadUpdate } from '@/ai/hooks/useApplyAgentChatThreadUpdate';
import { getToastOptionsFromError } from '@/error-handler/utils/getToastOptionsFromError';
import { useToast } from 'twenty-ui/feedback';
import { RenameChatThreadDocument } from '~/generated-metadata/graphql';

export const useRenameChatThread = () => {
  const { applyAgentChatThreadUpdate } = useApplyAgentChatThreadUpdate();
  const { enqueueToast } = useToast();

  const [renameChatThreadMutation] = useMutation(RenameChatThreadDocument);

  const renameChatThread = async (
    id: string,
    title: string,
  ): Promise<boolean> => {
    try {
      const { data } = await renameChatThreadMutation({
        variables: { id, title },
      });

      if (!data?.renameChatThread) {
        return false;
      }

      applyAgentChatThreadUpdate({
        id: data.renameChatThread.id,
        title: data.renameChatThread.title ?? null,
        updatedAt: data.renameChatThread.updatedAt,
      });

      return true;
    } catch (error) {
      enqueueToast(
        getToastOptionsFromError({
          error: CombinedGraphQLErrors.is(error) ? error : undefined,
        }),
      );

      return false;
    }
  };

  return { renameChatThread };
};
