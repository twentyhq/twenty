import { useMutation } from '@apollo/client/react';
import { CombinedGraphQLErrors } from '@apollo/client/errors';

import { useUpdateMetadataStoreDraft } from '@/metadata-store/hooks/useUpdateMetadataStoreDraft';
import { type FlatAgentChatThread } from '@/metadata-store/types/FlatAgentChatThread';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import { UnarchiveChatThreadDocument } from '~/generated-metadata/graphql';

export const useUnarchiveChatThread = () => {
  const { updateInDraft, applyChanges } = useUpdateMetadataStoreDraft();
  const { enqueueErrorSnackBar } = useSnackBar();

  const [unarchiveMutation] = useMutation(UnarchiveChatThreadDocument);

  const unarchiveChatThread = async (id: string) => {
    try {
      const { data } = await unarchiveMutation({ variables: { id } });

      if (data?.unarchiveChatThread) {
        updateInDraft('agentChatThreads', [
          {
            id: data.unarchiveChatThread.id,
            archivedAt: data.unarchiveChatThread.archivedAt ?? null,
            updatedAt: data.unarchiveChatThread.updatedAt,
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

  return { unarchiveChatThread };
};
