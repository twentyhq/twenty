import { StandardObjectNameSingular } from 'twenty-shared/types';
import { useToast } from 'twenty-ui/components/feedback';

import { getToastOptionsFromError } from '@/error-handler/utils/getToastOptionsFromError';
import { useDeleteManyRecords } from '@/object-record/hooks/useDeleteManyRecords';

export const useDetachAiChatThreadFromRecord = () => {
  const { enqueueToast } = useToast();
  const { deleteManyRecords: deleteLinks } = useDeleteManyRecords({
    objectNameSingular: StandardObjectNameSingular.AgentChatThreadTarget,
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
