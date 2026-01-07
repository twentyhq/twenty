import { useCallback } from 'react';

import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useUpdateManyRecords } from '@/object-record/hooks/useUpdateManyRecords';

type UpdateMessageFoldersSyncStatusArgs = {
  messageFolderIds: string[];
  isSynced: boolean;
};

export const useUpdateMessageFoldersSyncStatus = () => {
  const { updateManyRecords } = useUpdateManyRecords({
    objectNameSingular: CoreObjectNameSingular.MessageFolder,
    recordGqlFields: {
      id: true,
      isSynced: true,
    },
  });

  const updateMessageFoldersSyncStatus = useCallback(
    async ({
      messageFolderIds,
      isSynced,
    }: UpdateMessageFoldersSyncStatusArgs) => {
      await updateManyRecords({
        recordIdsToUpdate: messageFolderIds,
        updateOneRecordInput: { isSynced },
      });
    },
    [updateManyRecords],
  );

  return { updateMessageFoldersSyncStatus };
};
