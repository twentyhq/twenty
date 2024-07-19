import { useRecoilState } from 'recoil';

import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { getRecordsFromRecordConnection } from '@/object-record/cache/utils/getRecordsFromRecordConnection';
import { RecordGqlOperationFindManyResult } from '@/object-record/graphql/types/RecordGqlOperationFindManyResult';
import { cursorFamilyState } from '@/object-record/states/cursorFamilyState';
import { hasNextPageFamilyState } from '@/object-record/states/hasNextPageFamilyState';
import { OnFindManyRecordsCompleted } from '@/object-record/types/OnFindManyRecordsCompleted';
import { isDefined } from '~/utils/isDefined';

export const useHandleFindManyRecordsCompleted = <T>({
  queryIdentifier,
  onCompleted,
  objectMetadataItem,
}: {
  queryIdentifier: string;
  objectMetadataItem: ObjectMetadataItem;
  onCompleted?: OnFindManyRecordsCompleted<T>;
}) => {
  const [, setLastCursor] = useRecoilState(cursorFamilyState(queryIdentifier));

  const [, setHasNextPage] = useRecoilState(
    hasNextPageFamilyState(queryIdentifier),
  );

  const handleFindManyRecordsCompleted = (
    data: RecordGqlOperationFindManyResult,
  ) => {
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
  };

  return {
    handleFindManyRecordsCompleted,
  };
};
