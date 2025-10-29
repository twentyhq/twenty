import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { getRecordsFromRecordConnection } from '@/object-record/cache/utils/getRecordsFromRecordConnection';
import { type RecordGqlOperationGroupByResult } from '@/object-record/graphql/types/RecordGqlOperationGroupByResult';
import { type OnGroupByRecordsCompleted } from '@/object-record/types/OnGroupByRecordsCompleted';

export const useHandleGroupByRecordsCompleted = <T>({
  onCompleted,
  objectMetadataItem,
}: {
  objectMetadataItem: ObjectMetadataItem;
  onCompleted?: OnGroupByRecordsCompleted<T>;
}) => {
  const handleGroupByRecordsCompleted = (
    data: RecordGqlOperationGroupByResult,
  ) => {
    const groupByResults = data?.[`${objectMetadataItem.namePlural}GroupBy`];

    if (!groupByResults || !Array.isArray(groupByResults)) {
      onCompleted?.([], {
        groupByDimensionValues: [],
        pageInfo: undefined,
        totalCount: 0,
      });
      return;
    }

    const allRecords: T[] = [];
    groupByResults.forEach((group) => {
      const groupRecords = getRecordsFromRecordConnection({
        recordConnection: group,
      }) as T[];
      allRecords.push(...groupRecords);
    });

    const groupByDimensionValues = groupByResults.flatMap(
      (group) => group.groupByDimensionValues || [],
    );

    const totalCount = groupByResults.reduce(
      (sum, group) => sum + (group.totalCount || 0),
      0,
    );

    const pageInfo = groupByResults[0]?.pageInfo;

    onCompleted?.(allRecords, {
      groupByDimensionValues,
      pageInfo,
      totalCount,
    });
  };

  return {
    handleGroupByRecordsCompleted,
  };
};
