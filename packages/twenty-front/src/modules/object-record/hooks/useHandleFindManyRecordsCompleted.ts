import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { getRecordsFromRecordConnection } from '@/object-record/cache/utils/getRecordsFromRecordConnection';
import { type RecordGqlOperationFindManyResult } from '@/object-record/graphql/types/RecordGqlOperationFindManyResult';
import { cursorFamilyState } from '@/object-record/states/cursorFamilyState';
import { hasNextPageFamilyState } from '@/object-record/states/hasNextPageFamilyState';
import { type OnFindManyRecordsCompleted } from '@/object-record/types/OnFindManyRecordsCompleted';
import { jotaiStore } from '@/ui/utilities/state/jotai/jotaiStore';
import { useCallback } from 'react';
import { isDefined } from 'twenty-shared/utils';

export const useHandleFindManyRecordsCompleted = <T>({
  queryIdentifier,
  onCompleted,
  objectMetadataItem,
}: {
  queryIdentifier: string;
  objectMetadataItem: ObjectMetadataItem;
  onCompleted?: OnFindManyRecordsCompleted<T>;
}) => {
  const handleFindManyRecordsCompleted = useCallback(
    (data: RecordGqlOperationFindManyResult) => {
      const pageInfo = data?.[objectMetadataItem.namePlural]?.pageInfo;

      const records = getRecordsFromRecordConnection({
        recordConnection: data?.[objectMetadataItem.namePlural],
      }) as T[];

      onCompleted?.(records, {
        pageInfo,
        totalCount: data?.[objectMetadataItem.namePlural]?.totalCount,
      });

      if (isDefined(data?.[objectMetadataItem.namePlural])) {
        jotaiStore.set(
          cursorFamilyState.atomFamily(queryIdentifier),
          pageInfo.endCursor ?? '',
        );
        jotaiStore.set(
          hasNextPageFamilyState.atomFamily(queryIdentifier),
          pageInfo.hasNextPage ?? false,
        );
      }
    },
    [objectMetadataItem.namePlural, onCompleted, queryIdentifier],
  );

  return {
    handleFindManyRecordsCompleted,
  };
};
