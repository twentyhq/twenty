import { useMutation } from '@apollo/client/react';
import { CombinedGraphQLErrors } from '@apollo/client/errors';

import { useUpdateMetadataStoreDraft } from '@/metadata-store/hooks/useUpdateMetadataStoreDraft';
import { type FlatAgentChatThread } from '@/metadata-store/types/FlatAgentChatThread';
import { useSnackBar } from '@/ui/feedback/snack-bar-manager/hooks/useSnackBar';
import {
  ArchiveChatThreadDocument,
  UnarchiveChatThreadDocument,
} from '~/generated-metadata/graphql';

export const useArchiveChatThread = () => {
  const { updateInDraft, applyChanges } = useUpdateMetadataStoreDraft();
  const { enqueueErrorSnackBar } = useSnackBar();

  const [archiveMutation] = useMutation(ArchiveChatThreadDocument);
  const [unarchiveMutation] = useMutation(UnarchiveChatThreadDocument);

  const archiveChatThread = async (id: string) => {
    try {
      const { data } = await archiveMutation({ variables: { id } });

      if (data?.archiveChatThread) {
        updateInDraft('agentChatThreads', [
          {
            id: data.archiveChatThread.id,
            archivedAt: data.archiveChatThread.archivedAt ?? null,
            updatedAt: data.archiveChatThread.updatedAt,
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

  return { archiveChatThread, unarchiveChatThread };
};
