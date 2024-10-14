import { useApolloClient } from '@apollo/client';

import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { deleteRecordFromCache } from '@/object-record/cache/utils/deleteRecordFromCache';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';

export const useDeleteRecordFromCache = ({
  objectNameSingular,
}: {
  objectNameSingular: string;
}) => {
  const apolloClient = useApolloClient();

  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular,
  });

  const { objectMetadataItems } = useObjectMetadataItems();

  return (recordToDestroy: ObjectRecord) => {
    deleteRecordFromCache({
      objectMetadataItem,
      objectMetadataItems,
      recordToDestroy,
      cache: apolloClient.cache,
    });
  };
};
