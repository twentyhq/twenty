import { useToast } from 'twenty-ui/components/feedback';

import { getToastOptionsFromError } from '@/error-handler/utils/getToastOptionsFromError';
import { useInboxNamesByLegacyName } from '@/ai-chat/hooks/useInboxNamesByLegacyName';
import { useDeleteManyRecords } from '@/object-record/hooks/useDeleteManyRecords';

export const useDetachAiChatThreadFromRecord = () => {
  const { enqueueToast } = useToast();
  const inboxNamesByLegacyName = useInboxNamesByLegacyName();
  const { deleteManyRecords: deleteLinks } = useDeleteManyRecords({
    objectNameSingular: inboxNamesByLegacyName.agentChatThreadTarget,
  });

  const detachChatThreadFromRecord = async (linkIds: string[]) => {
    try {
      await deleteLinks({ recordIdsToDelete: linkIds });
    } catch (error) {
      enqueueToast(getToastOptionsFromError({ error }));
    }
  };

  return { detachChatThreadFromRecord };
};
