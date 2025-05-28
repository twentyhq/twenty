import { useApolloClient } from '@apollo/client';
import { useRecoilValue } from 'recoil';

import { currentUserWorkspaceState } from '@/auth/states/currentUserWorkspaceState';
import { useObjectMetadataItems } from '@/object-metadata/hooks/useObjectMetadataItems';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { getRecordsFromRecordConnection } from '@/object-record/cache/utils/getRecordsFromRecordConnection';
import { RecordGqlOperationFindManyResult } from '@/object-record/graphql/types/RecordGqlOperationFindManyResult';
import { RecordGqlOperationVariables } from '@/object-record/graphql/types/RecordGqlOperationVariables';
import { ObjectRecord } from '@/object-record/types/ObjectRecord';
import { generateFindManyRecordsQuery } from '@/object-record/utils/generateFindManyRecordsQuery';
import { isDefined } from 'twenty-shared/utils';
import { ObjectPermission } from '~/generated-metadata/graphql';

export const useReadFindManyRecordsQueryInCache = ({
  objectMetadataItem,
}: {
  objectMetadataItem: ObjectMetadataItem;
}) => {
  const apolloClient = useApolloClient();

  const { objectMetadataItems } = useObjectMetadataItems();

  const currentUserWorkspace = useRecoilValue(currentUserWorkspaceState);
  const objectPermissions = currentUserWorkspace?.objectPermissions;

  const objectPermissionsByObjectMetadataId = objectPermissions?.reduce(
    (acc, objectPermission) => {
      acc[objectPermission.objectMetadataId] = objectPermission;
      return acc;
    },
    {} as Record<string, ObjectPermission>,
  );

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
    });

    const existingRecordsQueryResult =
      apolloClient.readQuery<RecordGqlOperationFindManyResult>({
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
