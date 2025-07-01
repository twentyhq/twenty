import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { deleteRecordFromCache } from '@/object-record/cache/utils/deleteRecordFromCache';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';

export const useDeleteRecordFromCache = ({
  objectNameSingular,
}: {
  objectNameSingular: string;
}) => {
  const apolloCoreClient = useApolloCoreClient();

  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular,
  });

  const { objectMetadataItems } = useObjectMetadataItems();

  return (recordToDestroy: ObjectRecord) => {
    deleteRecordFromCache({
      objectMetadataItem,
      objectMetadataItems,
      recordToDestroy,
      cache: apolloCoreClient.cache,
    });
  };
};
