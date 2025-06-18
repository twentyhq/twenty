import { useSetRecoilState } from 'recoil';

import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { getRecordsFromRecordConnection } from '@/object-record/cache/utils/getRecordsFromRecordConnection';
import { RecordGqlOperationFindManyResult } from '@/object-record/graphql/types/RecordGqlOperationFindManyResult';
import { cursorFamilyState } from '@/object-record/states/cursorFamilyState';
import { hasNextPageFamilyState } from '@/object-record/states/hasNextPageFamilyState';
import { OnFindManyRecordsCompleted } from '@/object-record/types/OnFindManyRecordsCompleted';
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
  const setLastCursor = useSetRecoilState(cursorFamilyState(queryIdentifier));

  const setHasNextPage = useSetRecoilState(
    hasNextPageFamilyState(queryIdentifier),
  );

  const handleFindManyRecordsCompleted = useCallback(
    (data: RecordGqlOperationFindManyResult) => {
      if (!isDefined(data)) {
        onCompleted?.([]);
      }

      const pageInfo = data?.[objectMetadataItem.namePlural]?.pageInfo;

      const records = getRecordsFromRecordConnection({
        recordConnection: data?.[objectMetadataItem.namePlural],
      }) as T[];

      onCompleted?.(records, {
        pageInfo,
        totalCount: data?.[objectMetadataItem.namePlural]?.totalCount,
      });

      if (isDefined(data?.[objectMetadataItem.namePlural])) {
        setLastCursor(pageInfo.endCursor ?? '');
        setHasNextPage(pageInfo.hasNextPage ?? false);
      }
    },
    [onCompleted, objectMetadataItem.namePlural, setLastCursor, setHasNextPage],
  );

  return {
    handleFindManyRecordsCompleted,
  };
};
