import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { getRecordsFromRecordConnection } from '@/object-record/cache/utils/getRecordsFromRecordConnection';
import { RecordGqlOperationFindManyResult } from '@/object-record/graphql/types/RecordGqlOperationFindManyResult';
import { RecordGqlOperationVariables } from '@/object-record/graphql/types/RecordGqlOperationVariables';
import { useObjectPermissions } from '@/object-record/hooks/useObjectPermissions';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { generateFindManyRecordsQuery } from '@/object-record/utils/generateFindManyRecordsQuery';
import { useFeatureFlagsMap } from '@/workspace/hooks/useFeatureFlagsMap';
import { isDefined } from 'twenty-shared/utils';
import { FeatureFlagKey } from '~/generated/graphql';

export const useReadFindManyRecordsQueryInCache = ({
  objectMetadataItem,
}: {
  objectMetadataItem: ObjectMetadataItem;
}) => {
  const apolloCoreClient = useApolloCoreClient();

  const { objectMetadataItems } = useObjectMetadataItems();

  const { objectPermissionsByObjectMetadataId } = useObjectPermissions();

  const featureFlags = useFeatureFlagsMap();
  const isFieldsPermissionsEnabled =
    featureFlags[FeatureFlagKey.IS_FIELDS_PERMISSIONS_ENABLED];

  const readFindManyRecordsQueryInCache = <
    T extends ObjectRecord = ObjectRecord,
  >({
    queryVariables,
    recordGqlFields,
  }: {
    queryVariables: RecordGqlOperationVariables;
    recordGqlFields?: Record<string, any>;
  }) => {
    const findManyRecordsQueryForCacheRead = generateFindManyRecordsQuery({
      objectMetadataItem,
      objectMetadataItems,
      recordGqlFields,
      objectPermissionsByObjectMetadataId,
      isFieldsPermissionsEnabled,
    });

    const existingRecordsQueryResult =
      apolloCoreClient.readQuery<RecordGqlOperationFindManyResult>({
        query: findManyRecordsQueryForCacheRead,
        variables: queryVariables,
      });

    const existingRecordConnection =
      existingRecordsQueryResult?.[objectMetadataItem.namePlural];

    const existingObjectRecords = isDefined(existingRecordConnection)
      ? getRecordsFromRecordConnection<T>({
          recordConnection: existingRecordConnection,
        })
      : [];

    return existingObjectRecords;
  };

  return {
    readFindManyRecordsQueryInCache,
  };
};
