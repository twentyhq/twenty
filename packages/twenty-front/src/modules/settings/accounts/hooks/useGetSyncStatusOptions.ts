import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { isUndefinedOrNull } from '~/utils/isUndefinedOrNull';

export const useGetSyncStatusOptions = () => {
  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular: CoreObjectNameSingular.MessageChannel,
  });

  if (isUndefinedOrNull(objectMetadataItem)) {
    throw new Error('ObjectMetadataItem not found for MessageChannel');
  }

  const syncStatusMetadata = objectMetadataItem.fields.find(
    (field) => field.name === 'syncStatus',
  );

  const syncStatusOptions = syncStatusMetadata?.options;

  if (isUndefinedOrNull(syncStatusMetadata)) {
    throw new Error('syncStatusMetaData not found for MessageChannel');
  }

  return syncStatusOptions;
};
