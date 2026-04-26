import { useMutation } from '@apollo/client/react';
import { CombinedGraphQLErrors } from '@apollo/client/errors';

import { useUpdateMetadataStoreDraft } from '@/metadata-store/hooks/useUpdateMetadataStoreDraft';
import { type FlatAgentChatThread } from '@/metadata-store/types/FlatAgentChatThread';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { RenameChatThreadDocument } from '~/generated-metadata/graphql';

export const useRenameChatThread = () => {
  const { updateInDraft, applyChanges } = useUpdateMetadataStoreDraft();
  const { enqueueErrorSnackBar } = useSnackBar();

  const [renameChatThreadMutation] = useMutation(RenameChatThreadDocument);

  const renameChatThread = async (id: string, title: string) => {
    try {
      const { data } = await renameChatThreadMutation({
        variables: { id, title },
      });

      if (data?.renameChatThread) {
        updateInDraft('agentChatThreads', [
          {
            id: data.renameChatThread.id,
            title: data.renameChatThread.title ?? null,
            updatedAt: data.renameChatThread.updatedAt,
          } as FlatAgentChatThread,
        ]);
        applyChanges();
      }
    } catch (error) {
      enqueueErrorSnackBar({
        apolloError: CombinedGraphQLErrors.is(error) ? error : undefined,
      });
    }
  };

  return { renameChatThread };
};
