import { useToast } from 'twenty-ui/components';

import { AGENT_CHAT_THREAD_TARGET_OBJECT_NAME_SINGULAR } from '@/ai/constants/AgentChatThreadTargetObjectNameSingular';
import { getToastOptionsFromError } from '@/error-handler/utils/getToastOptionsFromError';
import { useDeleteManyRecords } from '@/object-record/hooks/useDeleteManyRecords';

export const useDetachChatThreadFromRecord = () => {
  const { enqueueToast } = useToast();
  const { deleteManyRecords: deleteLinks } = useDeleteManyRecords({
    objectNameSingular: AGENT_CHAT_THREAD_TARGET_OBJECT_NAME_SINGULAR,
  });

  // Takes every link between the conversation and the record: a custom leg
  // carries no unique index, so there can be more than one.
  const detachChatThreadFromRecord = async (linkIds: string[]) => {
    try {
      await deleteLinks({ recordIdsToDelete: linkIds });
    } catch (error) {
      enqueueToast(getToastOptionsFromError({ error }));
    }
  };

  return { detachChatThreadFromRecord };
};
