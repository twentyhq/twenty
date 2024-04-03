import { useApolloClient } from '@apollo/client';

import { useObjectMetadataItemOnly } from '@/object-metadata/hooks/useObjectMetadataItemOnly';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { deleteRecordFromCache } from '@/object-record/cache/utils/deleteRecordFromCache';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';

export const useDeleteRecordFromCache = ({
  objectNameSingular,
}: {
  objectNameSingular: string;
}) => {
  const apolloClient = useApolloClient();

  const { objectMetadataItem } = useObjectMetadataItemOnly({
    objectNameSingular,
  });

  const { objectMetadataItems } = useObjectMetadataItems();

  return (recordToDelete: ObjectRecord) => {
    deleteRecordFromCache({
      objectMetadataItem,
      objectMetadataItems,
      recordToDelete,
      cache: apolloClient.cache,
    });
  };
};
