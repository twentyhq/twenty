import { useQuery } from '@apollo/client';
import { useMemo } from 'react';

import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { type ObjectMetadataItemIdentifier } from '@/object-metadata/types/ObjectMetadataItemIdentifier';
import { getRecordFromRecordNode } from '@/object-record/cache/utils/getRecordFromRecordNode';
import { useGenerateDepthRecordGqlFieldsFromObject } from '@/object-record/graphql/record-gql-fields/hooks/useGenerateDepthRecordGqlFieldsFromObject';
import { type RecordGqlNode } from '@/object-record/graphql/types/RecordGqlNode';
import { type RecordGqlOperationGqlRecordFields } from '@/object-record/graphql/types/RecordGqlOperationGqlRecordFields';
import { useFindOneRecordQuery } from '@/object-record/hooks/useFindOneRecordQuery';
import { useObjectPermissionsForObject } from '@/object-record/hooks/useObjectPermissionsForObject';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { isDefined } from 'twenty-shared/utils';

export const useFindOneRecord = <T extends ObjectRecord = ObjectRecord>({
  objectNameSingular,
  objectRecordId = '',
  recordGqlFields,
  onCompleted,
  skip,
  withSoftDeleted = false,
}: ObjectMetadataItemIdentifier & {
  objectRecordId: string | undefined;
  recordGqlFields?: RecordGqlOperationGqlRecordFields;
  onCompleted?: (data: T) => void;
  skip?: boolean;
  withSoftDeleted?: boolean;
}) => {
  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular,
  });

  const { recordGqlFields: depthOneRecordGqlFields } =
    useGenerateDepthRecordGqlFieldsFromObject({
      objectNameSingular,
      depth: 1,
    });

  const apolloCoreClient = useApolloCoreClient();

  const computedRecordGqlFields = recordGqlFields ?? depthOneRecordGqlFields;

  const { findOneRecordQuery } = useFindOneRecordQuery({
    objectNameSingular,
    recordGqlFields: computedRecordGqlFields,
    withSoftDeleted,
  });

  const objectPermissions = useObjectPermissionsForObject(
    objectMetadataItem.id,
  );

  const hasReadPermission = objectPermissions.canReadObjectRecords;

  const { data, loading, error } = useQuery<{
    [nameSingular: string]: RecordGqlNode;
  }>(findOneRecordQuery, {
    skip: !objectMetadataItem || !objectRecordId || skip || !hasReadPermission,
    variables: { objectRecordId },
    client: apolloCoreClient,
    onCompleted: (data) => {
      const recordWithoutConnection = getRecordFromRecordNode<T>({
        recordNode: { ...data[objectNameSingular] },
      });

      if (isDefined(recordWithoutConnection)) {
        onCompleted?.(recordWithoutConnection);
      }
    },
  });

  // TODO: Remove connection from record
  const recordWithoutConnection = useMemo(
    () =>
      data?.[objectNameSingular]
        ? getRecordFromRecordNode<T>({
            recordNode: data?.[objectNameSingular],
          })
        : undefined,
    [data, objectNameSingular],
  );

  return {
    record: recordWithoutConnection,
    loading,
    error,
  };
};
