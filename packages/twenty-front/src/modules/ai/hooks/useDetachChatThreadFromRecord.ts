import { CoreObjectNameSingular } from 'twenty-shared/types';
import { useToast } from 'twenty-ui/components';

import { getToastOptionsFromError } from '@/error-handler/utils/getToastOptionsFromError';
import { useDeleteManyRecords } from '@/object-record/hooks/useDeleteManyRecords';

export const useDetachChatThreadFromRecord = () => {
  const { enqueueToast } = useToast();
  const { deleteManyRecords: deleteLinks } = useDeleteManyRecords({
    objectNameSingular: CoreObjectNameSingular.AgentChatThreadTarget,
  });

  // A custom leg has no unique index, so there can be several links.
  const detachChatThreadFromRecord = async (linkIds: string[]) => {
    try {
      await deleteLinks({ recordIdsToDelete: linkIds });
    } catch (error) {
      enqueueToast(getToastOptionsFromError({ error }));
    }
  };

  return { detachChatThreadFromRecord };
};
