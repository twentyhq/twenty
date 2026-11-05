import { STANDARD_OBJECTS } from 'twenty-shared/metadata';
import { useObjectMetadataItemByUniversalIdentifier } from '@/object-metadata/hooks/useObjectMetadataItemByUniversalIdentifier';
import { useToast } from 'twenty-ui/components/feedback';

import { getToastOptionsFromError } from '@/error-handler/utils/getToastOptionsFromError';
import { useDeleteManyRecords } from '@/object-record/hooks/useDeleteManyRecords';

export const useDetachChatThreadFromRecord = () => {
  const { objectMetadataItem: threadTargetObjectMetadataItem } =
    useObjectMetadataItemByUniversalIdentifier({
      universalIdentifier:
        STANDARD_OBJECTS.agentChatThreadTarget.universalIdentifier,
    });
  const { enqueueToast } = useToast();
  const { deleteManyRecords: deleteLinks } = useDeleteManyRecords({
    objectNameSingular: threadTargetObjectMetadataItem.nameSingular,
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
