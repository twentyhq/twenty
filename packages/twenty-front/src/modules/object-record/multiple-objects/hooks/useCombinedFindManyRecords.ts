import { useQuery } from '@apollo/client';

import { getRecordsFromRecordConnection } from '@/object-record/cache/utils/getRecordsFromRecordConnection';
import { EMPTY_QUERY } from '@/object-record/constants/EmptyQuery';
import { useGenerateCombinedFindManyRecordsQuery } from '@/object-record/multiple-objects/hooks/useGenerateCombinedFindManyRecordsQuery';
import { QueryKey } from '@/object-record/query-keys/types/QueryKey';
import { MultiObjectRecordQueryResult } from '@/object-record/relation-picker/hooks/useMultiObjectRecordsQueryResultFormattedAsObjectRecordForSelectArray';

export const useCombinedFindManyRecords = ({
  queryKeys,
  skip = false,
}: {
  queryKeys: QueryKey[];
  skip: boolean;
}) => {
  const findManyQuery = useGenerateCombinedFindManyRecordsQuery({
    queryKeys,
  });

  const { data } = useQuery<MultiObjectRecordQueryResult>(
    findManyQuery ?? EMPTY_QUERY,
    {
      skip,
    },
  );

  const resultWithoutConnection = Object.fromEntries(
    Object.entries(data ?? {}).map(([namePlural, objectRecordConnection]) => [
      namePlural,
      getRecordsFromRecordConnection({
        recordConnection: objectRecordConnection,
      }),
    ]),
  );

  return {
    result: resultWithoutConnection,
  };
};
