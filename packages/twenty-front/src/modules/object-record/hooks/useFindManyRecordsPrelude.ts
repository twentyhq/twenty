import { isDefined } from 'twenty-shared/utils';

import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { type UseFindManyRecordsParams } from '@/object-record/hooks/useFindManyRecords';
import { useFindManyRecordsQuery } from '@/object-record/hooks/useFindManyRecordsQuery';
import { useHandleFindManyRecordsCompleted } from '@/object-record/hooks/useHandleFindManyRecordsCompleted';
import { useHandleFindManyRecordsError } from '@/object-record/hooks/useHandleFindManyRecordsError';
import { useObjectPermissionsForObject } from '@/object-record/hooks/useObjectPermissionsForObject';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { getQueryIdentifier } from '@/object-record/utils/getQueryIdentifier';
import { type RecordGqlOperationFilter } from 'twenty-shared/types';

import { QUERY_DEFAULT_LIMIT_RECORDS } from 'twenty-shared/constants';

// Everything useFindManyRecords and useSuspenseFindManyRecords share ahead of
// executing the query: document, variables ingredients, permission gating and
// result handlers. Keeping it in one place is what guarantees both hook
// families produce identical cache entries.
export const useFindManyRecordsPrelude = <
  T extends ObjectRecord = ObjectRecord,
>({
  objectNameSingular,
  filter,
  orderBy,
  skip,
  recordGqlFields,
  onError,
  onCompleted,
  cursorFilter,
  limit = QUERY_DEFAULT_LIMIT_RECORDS,
  withSoftDeleted = false,
}: Omit<UseFindManyRecordsParams<T>, 'fetchPolicy'>) => {
  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular,
  });
  const apolloCoreClient = useApolloCoreClient();
  const { findManyRecordsQuery } = useFindManyRecordsQuery({
    objectNameSingular,
    recordGqlFields,
    cursorDirection: cursorFilter?.cursorDirection,
  });

  const { handleFindManyRecordsError } = useHandleFindManyRecordsError({
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
    limit,
  });

  const { handleFindManyRecordsCompleted } = useHandleFindManyRecordsCompleted({
    objectMetadataItem,
    queryIdentifier,
    onCompleted,
  });

  const objectPermissions = useObjectPermissionsForObject(
    objectMetadataItem.id,
  );

  const hasReadPermission = objectPermissions.canReadObjectRecords;

  const shouldSkip =
    skip || !isDefined(objectMetadataItem) || !hasReadPermission;

  return {
    objectMetadataItem,
    apolloCoreClient,
    findManyRecordsQuery,
    withSoftDeleteFilter,
    queryIdentifier,
    shouldSkip,
    handleFindManyRecordsCompleted,
    handleFindManyRecordsError,
  };
};
