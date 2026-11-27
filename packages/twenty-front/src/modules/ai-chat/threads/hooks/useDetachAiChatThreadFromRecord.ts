import { useToast } from 'twenty-ui/components/feedback';

import { getToastOptionsFromError } from '@/error-handler/utils/getToastOptionsFromError';
import { inboxNamesByLegacyNameSelector } from '@/ai-chat/states/selectors/inboxNamesByLegacyNameSelector';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useDeleteManyRecords } from '@/object-record/hooks/useDeleteManyRecords';

export const useDetachAiChatThreadFromRecord = () => {
  const { enqueueToast } = useToast();
  const inboxNamesByLegacyName = useAtomStateValue(
    inboxNamesByLegacyNameSelector,
  );
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
