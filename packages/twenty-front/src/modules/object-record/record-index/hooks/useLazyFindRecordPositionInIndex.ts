import { useCallback } from 'react';

import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { getRecordsFromRecordConnection } from '@/object-record/cache/utils/getRecordsFromRecordConnection';
import { type RecordGqlOperationFindManyResult } from '@/object-record/graphql/types/RecordGqlOperationFindManyResult';
import { computeCursorArgFilter } from '@/object-record/graphql/utils/computeCursorArgFilter';
import { extractOrderByFieldNames } from '@/object-record/graphql/utils/extractOrderByFieldNames';
import { useFindManyRecordsQuery } from '@/object-record/hooks/useFindManyRecordsQuery';
import { useObjectPermissionsForObject } from '@/object-record/hooks/useObjectPermissionsForObject';
import { useFindManyRecordIndexTableParams } from '@/object-record/record-index/hooks/useFindManyRecordIndexTableParams';
import { combineFilters, isDefined } from 'twenty-shared/utils';

// The index paginates by offset, so the number of records the current filters
// and sorts place before a record is that record's row index, even when the
// table has not loaded it yet.
export const useLazyFindRecordPositionInIndex = (
  objectNameSingular: string,
) => {
  const { objectMetadataItem } = useObjectMetadataItem({
    objectNameSingular,
  });

  const { filter, orderBy } =
    useFindManyRecordIndexTableParams(objectNameSingular);

  const apolloCoreClient = useApolloCoreClient();

  const { canReadObjectRecords } = useObjectPermissionsForObject(
    objectMetadataItem.id,
  );

  const { findManyRecordsQuery: findTargetRecordQuery } =
    useFindManyRecordsQuery({
      objectNameSingular,
      recordGqlFields: extractOrderByFieldNames(orderBy),
    });

  const { findManyRecordsQuery: countRecordsQuery } = useFindManyRecordsQuery({
    objectNameSingular,
    recordGqlFields: { id: true },
  });

  const findRecordPositionInIndex = useCallback(
    async (recordId: string): Promise<number | null> => {
      if (!canReadObjectRecords) {
        return null;
      }

      try {
        const targetRecordResult =
          await apolloCoreClient.query<RecordGqlOperationFindManyResult>({
            query: findTargetRecordQuery,
            variables: {
              filter: combineFilters([filter, { id: { eq: recordId } }]),
              limit: 1,
            },
            fetchPolicy: 'no-cache',
          });

        const targetRecordConnection =
          targetRecordResult.data?.[objectMetadataItem.namePlural];

        if (!isDefined(targetRecordConnection)) {
          return null;
        }

        const [targetRecord] = getRecordsFromRecordConnection({
          recordConnection: targetRecordConnection,
        });

        if (!isDefined(targetRecord)) {
          return null;
        }

        const recordsBeforeTargetFilter = computeCursorArgFilter({
          orderBy,
          cursorRecordValues: targetRecord,
          isForwardPagination: false,
        });

        const countResult =
          await apolloCoreClient.query<RecordGqlOperationFindManyResult>({
            query: countRecordsQuery,
            variables: {
              filter: combineFilters([filter, recordsBeforeTargetFilter]),
              limit: 1,
            },
            fetchPolicy: 'no-cache',
          });

        return (
          countResult.data?.[objectMetadataItem.namePlural]?.totalCount ?? null
        );
      } catch {
        return null;
      }
    },
    [
      apolloCoreClient,
      canReadObjectRecords,
      countRecordsQuery,
      filter,
      findTargetRecordQuery,
      objectMetadataItem.namePlural,
      orderBy,
    ],
  );

  return { findRecordPositionInIndex };
};
