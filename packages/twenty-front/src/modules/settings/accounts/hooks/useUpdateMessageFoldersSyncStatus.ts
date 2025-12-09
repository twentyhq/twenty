import { useCallback } from 'react';

import { triggerUpdateRecordOptimisticEffectByBatch } from '@/apollo/optimistic-effect/utils/triggerUpdateRecordOptimisticEffectByBatch';
import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useGetRecordFromCache } from '@/object-record/cache/hooks/useGetRecordFromCache';
import { getObjectTypename } from '@/object-record/cache/utils/getObjectTypename';
import { getRecordNodeFromRecord } from '@/object-record/cache/utils/getRecordNodeFromRecord';
import { updateRecordFromCache } from '@/object-record/cache/utils/updateRecordFromCache';
import { type RecordGqlNode } from '@/object-record/graphql/types/RecordGqlNode';
import { useObjectPermissions } from '@/object-record/hooks/useObjectPermissions';
import { useUpsertRecordsInStore } from '@/object-record/record-store/hooks/useUpsertRecordsInStore';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { UPDATE_MESSAGE_FOLDERS_SYNC_STATUS } from '@/settings/accounts/graphql/mutations/updateMessageFoldersSyncStatus';
import { isDefined } from 'twenty-shared/utils';

type UseUpdateMessageFoldersSyncStatusProps = {
  messageChannelId: string;
};

type UpdateMessageFoldersSyncStatusArgs = {
  messageFolderIds: string[];
  isSynced: boolean;
};

export const useUpdateMessageFoldersSyncStatus = ({
  messageChannelId,
}: UseUpdateMessageFoldersSyncStatusProps) => {
  const apolloCoreClient = useApolloCoreClient();
  const { upsertRecordsInStore } = useUpsertRecordsInStore();

  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular: CoreObjectNameSingular.MessageFolder,
  });

  const { objectMetadataItems } = useObjectMetadataItems();
  const { objectPermissionsByObjectMetadataId } = useObjectPermissions();

  const getRecordFromCache = useGetRecordFromCache({
    objectNameSingular: CoreObjectNameSingular.MessageFolder,
  });

  const updateMessageFoldersSyncStatus = useCallback(
    async ({
      messageFolderIds,
      isSynced,
    }: UpdateMessageFoldersSyncStatusArgs) => {
      const cachedFolders = messageFolderIds
        .map((folderId) => getRecordFromCache(folderId, apolloCoreClient.cache))
        .filter(isDefined);

      const cachedRecordsNode: RecordGqlNode[] = [];
      const optimisticRecordsNode: RecordGqlNode[] = [];

      const recordGqlFields = {
        isSynced: true,
      };

      cachedFolders.forEach((cachedFolder) => {
        const cachedRecordNode = getRecordNodeFromRecord<ObjectRecord>({
          record: cachedFolder,
          objectMetadataItem,
          objectMetadataItems,
          computeReferences: false,
        });

        const optimisticRecord = {
          ...cachedFolder,
          isSynced,
          __typename: getObjectTypename(objectMetadataItem.nameSingular),
        };

        const optimisticRecordNode = getRecordNodeFromRecord<ObjectRecord>({
          record: optimisticRecord,
          objectMetadataItem,
          objectMetadataItems,
          computeReferences: false,
        });

        if (isDefined(optimisticRecordNode) && isDefined(cachedRecordNode)) {
          updateRecordFromCache({
            objectMetadataItems,
            objectMetadataItem,
            cache: apolloCoreClient.cache,
            record: optimisticRecord,
            recordGqlFields,
            objectPermissionsByObjectMetadataId,
          });

          optimisticRecordsNode.push(optimisticRecordNode);
          cachedRecordsNode.push(cachedRecordNode);
        }
      });

      triggerUpdateRecordOptimisticEffectByBatch({
        cache: apolloCoreClient.cache,
        objectMetadataItem,
        currentRecords: cachedRecordsNode,
        updatedRecords: optimisticRecordsNode,
        objectMetadataItems,
        objectPermissionsByObjectMetadataId,
        upsertRecordsInStore,
      });

      await apolloCoreClient
        .mutate({
          mutation: UPDATE_MESSAGE_FOLDERS_SYNC_STATUS,
          variables: {
            input: {
              messageFolderIds,
              messageChannelId,
              isSynced,
            },
          },
        })
        .then(async () => {
          await apolloCoreClient.refetchQueries({
            include: 'active',
          });
        })
        .catch((error: Error) => {
          cachedFolders.forEach((cachedFolder) => {
            updateRecordFromCache({
              objectMetadataItems,
              objectMetadataItem,
              cache: apolloCoreClient.cache,
              record: cachedFolder,
              recordGqlFields,
              objectPermissionsByObjectMetadataId,
            });
          });

          triggerUpdateRecordOptimisticEffectByBatch({
            cache: apolloCoreClient.cache,
            objectMetadataItem,
            currentRecords: optimisticRecordsNode,
            updatedRecords: cachedRecordsNode,
            objectMetadataItems,
            objectPermissionsByObjectMetadataId,
            upsertRecordsInStore,
          });

          throw error;
        });
    },
    [
      apolloCoreClient,
      getRecordFromCache,
      messageChannelId,
      objectMetadataItem,
      objectMetadataItems,
      objectPermissionsByObjectMetadataId,
      upsertRecordsInStore,
    ],
  );

  return { updateMessageFoldersSyncStatus };
};
