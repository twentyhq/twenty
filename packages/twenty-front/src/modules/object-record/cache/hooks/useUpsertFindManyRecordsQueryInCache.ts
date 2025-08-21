import { useRecoilValue } from 'recoil';

import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { objectMetadataItemsState } from '@/object-metadata/states/objectMetadataItemsState';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { getRecordConnectionFromRecords } from '@/object-record/cache/utils/getRecordConnectionFromRecords';
import { type RecordGqlOperationVariables } from '@/object-record/graphql/types/RecordGqlOperationVariables';
import { useObjectPermissions } from '@/object-record/hooks/useObjectPermissions';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { generateFindManyRecordsQuery } from '@/object-record/utils/generateFindManyRecordsQuery';

export const useUpsertFindManyRecordsQueryInCache = ({
  objectMetadataItem,
}: {
  objectMetadataItem: ObjectMetadataItem;
}) => {
  const apolloCoreClient = useApolloCoreClient();

  const objectMetadataItems = useRecoilValue(objectMetadataItemsState);
  const { objectPermissionsByObjectMetadataId } = useObjectPermissions();

  const upsertFindManyRecordsQueryInCache = <
    T extends ObjectRecord = ObjectRecord,
  >({
    queryVariables,
    objectRecordsToOverwrite,
    recordGqlFields,
    computeReferences = false,
  }: {
    queryVariables: RecordGqlOperationVariables;
    objectRecordsToOverwrite: T[];
    recordGqlFields?: Record<string, any>;
    computeReferences?: boolean;
  }) => {
    const findManyRecordsQueryForCacheOverwrite = generateFindManyRecordsQuery({
      objectMetadataItem,
      objectMetadataItems,
      recordGqlFields,
      computeReferences,
      objectPermissionsByObjectMetadataId,
    });

    const newObjectRecordConnection = getRecordConnectionFromRecords({
      objectMetadataItems: objectMetadataItems,
      objectMetadataItem: objectMetadataItem,
      records: objectRecordsToOverwrite,
      recordGqlFields,
      computeReferences,
    });

    apolloCoreClient.writeQuery({
      query: findManyRecordsQueryForCacheOverwrite,
      variables: queryVariables,
      data: {
        [objectMetadataItem.namePlural]: newObjectRecordConnection,
      },
    });
  };

  return {
    upsertFindManyRecordsQueryInCache,
  };
};
