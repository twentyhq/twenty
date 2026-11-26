import { useToast } from 'twenty-ui/components/feedback';

import { getToastOptionsFromError } from '@/error-handler/utils/getToastOptionsFromError';
import { useInboxObjectNames } from '@/ai-chat/hooks/useInboxObjectNames';
import { useDeleteManyRecords } from '@/object-record/hooks/useDeleteManyRecords';

export const useDetachAiChatThreadFromRecord = () => {
  const { enqueueToast } = useToast();
  const inboxObjectNames = useInboxObjectNames();
  const { deleteManyRecords: deleteLinks } = useDeleteManyRecords({
    objectNameSingular: inboxObjectNames.agentChatThreadTarget,
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
