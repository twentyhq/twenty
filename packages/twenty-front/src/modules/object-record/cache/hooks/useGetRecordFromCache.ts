import { useCallback } from 'react';

import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { getRecordFromCache } from '@/object-record/cache/utils/getRecordFromCache';
import { type RecordGqlFields } from '@/object-record/graphql/types/RecordGqlFields';
import { generateDepthRecordGqlFields } from '@/object-record/graphql/utils/generateDepthRecordGqlFields';
import { useObjectPermissions } from '@/object-record/hooks/useObjectPermissions';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';

export const useGetRecordFromCache = ({
  objectNameSingular,
  recordGqlFields,
}: {
  objectNameSingular: string;
  recordGqlFields?: RecordGqlFields;
}) => {
  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular,
  });
  const { objectMetadataItems } = useObjectMetadataItems();

  const { objectPermissionsByObjectMetadataId } = useObjectPermissions();

  const appliedRecordGqlFields =
    recordGqlFields ??
    generateDepthRecordGqlFields({
      objectMetadataItem,
      objectMetadataItems,
      depth: 1,
    });

  const apolloCoreClient = useApolloCoreClient();

  return useCallback(
    <T extends ObjectRecord = ObjectRecord>(
      recordId: string,
      cache = apolloCoreClient.cache,
    ) => {
      return getRecordFromCache<T>({
        cache,
        recordId,
        objectMetadataItems,
        objectMetadataItem,
        recordGqlFields: appliedRecordGqlFields,
        objectPermissionsByObjectMetadataId,
      });
    },
    [
      apolloCoreClient.cache,
      objectMetadataItems,
      objectMetadataItem,
      appliedRecordGqlFields,
      objectPermissionsByObjectMetadataId,
    ],
  );
};
