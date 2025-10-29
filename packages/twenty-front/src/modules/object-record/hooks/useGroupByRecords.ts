import { useQuery, type WatchQueryFetchPolicy } from '@apollo/client';

import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { type ObjectMetadataItemIdentifier } from '@/object-metadata/types/ObjectMetadataItemIdentifier';
import { getRecordsFromRecordConnection } from '@/object-record/cache/utils/getRecordsFromRecordConnection';
import { type RecordGqlOperationGqlRecordFields } from '@/object-record/graphql/types/RecordGqlOperationGqlRecordFields';
import { type RecordGqlOperationGroupByResult } from '@/object-record/graphql/types/RecordGqlOperationGroupByResult';
import { type RecordGqlOperationGroupByVariables } from '@/object-record/graphql/types/RecordGqlOperationGroupByVariables';
import { useGroupByRecordsQuery } from '@/object-record/hooks/useGroupByRecordsQuery';
import { useHandleGroupByRecordsCompleted } from '@/object-record/hooks/useHandleGroupByRecordsCompleted';
import { useHandleGroupByRecordsError } from '@/object-record/hooks/useHandleGroupByRecordsError';
import { useObjectPermissionsForObject } from '@/object-record/hooks/useObjectPermissionsForObject';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { type OnGroupByRecordsCompleted } from '@/object-record/types/OnGroupByRecordsCompleted';
import { getQueryIdentifier } from '@/object-record/utils/getQueryIdentifier';

import { useMemo } from 'react';
import { type RecordGqlOperationFilter } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

export type UseGroupByRecordsParams<T> = ObjectMetadataItemIdentifier &
  RecordGqlOperationGroupByVariables & {
    onError?: (error?: Error) => void;
    onCompleted?: OnGroupByRecordsCompleted<T>;
    skip?: boolean;
    recordGqlFields?: RecordGqlOperationGqlRecordFields;
    fetchPolicy?: WatchQueryFetchPolicy;
    withSoftDeleted?: boolean;
  };

export const useGroupByRecords = <T extends ObjectRecord = ObjectRecord>({
  objectNameSingular,
  groupBy,
  filter,
  orderBy,
  orderByForRecords,
  viewId,
  skip,
  recordGqlFields,
  fetchPolicy,
  onError,
  onCompleted,
  withSoftDeleted = false,
}: UseGroupByRecordsParams<T>) => {
  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular,
  });
  const apolloCoreClient = useApolloCoreClient();
  const { groupByRecordsQuery } = useGroupByRecordsQuery({
    objectNameSingular,
    recordGqlFields,
  });

  const { handleGroupByRecordsError } = useHandleGroupByRecordsError({
    objectMetadataItem,
    handleError: onError,
  });

  const softDeleteFilter: RecordGqlOperationFilter = {
    or: [{ deletedAt: { is: 'NULL' } }, { deletedAt: { is: 'NOT_NULL' } }],
  };

  const withSoftDeleteFilter = withSoftDeleted
    ? {
        and: [...(filter ? [filter] : []), softDeleteFilter],
      }
    : filter;

  const queryIdentifier = getQueryIdentifier({
    objectNameSingular,
    filter: withSoftDeleteFilter,
    orderBy,
    groupBy,
  });

  const { handleGroupByRecordsCompleted } = useHandleGroupByRecordsCompleted({
    objectMetadataItem,
    onCompleted,
  });

  const objectPermissions = useObjectPermissionsForObject(
    objectMetadataItem.id,
  );

  const hasReadPermission = objectPermissions.canReadObjectRecords;

  const { data, loading, error } = useQuery<RecordGqlOperationGroupByResult>(
    groupByRecordsQuery,
    {
      skip: skip || !objectMetadataItem || !hasReadPermission,
      variables: {
        groupBy,
        filter: withSoftDeleteFilter,
        orderBy,
        orderByForRecords,
        viewId,
      },
      fetchPolicy: fetchPolicy,
      onCompleted: handleGroupByRecordsCompleted,
      onError: handleGroupByRecordsError,
      client: apolloCoreClient,
    },
  );

  const groupByResults = data?.[`${objectMetadataItem.namePlural}GroupBy`];

  const records = useMemo(() => {
    if (!isDefined(groupByResults) || !Array.isArray(groupByResults)) {
      return [];
    }

    const allRecords: T[] = [];
    groupByResults.forEach((group) => {
      const groupRecords = getRecordsFromRecordConnection<T>({
        recordConnection: group,
      });
      allRecords.push(...groupRecords);
    });

    return allRecords;
  }, [groupByResults]);

  const getGroupByDimensionValues = () => {
    if (!isDefined(groupByResults) || !Array.isArray(groupByResults)) {
      return [];
    }
    return groupByResults.flatMap(
      (group) => group.groupByDimensionValues || [],
    );
  };
  const groupByDimensionValues = getGroupByDimensionValues();

  const getTotalCount = () => {
    if (!isDefined(groupByResults) || !Array.isArray(groupByResults)) {
      return 0;
    }
    return groupByResults.reduce(
      (sum, group) => sum + (group.totalCount || 0),
      0,
    );
  };
  const totalCount = getTotalCount();

  const pageInfo = groupByResults?.[0]?.pageInfo;

  return {
    objectMetadataItem,
    records,
    groupByDimensionValues,
    totalCount,
    loading,
    error,
    queryIdentifier,
    pageInfo,
  };
};
