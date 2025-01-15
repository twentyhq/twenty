import { useQuery } from '@apollo/client';

import { getRecordsFromRecordConnection } from '@/object-record/cache/utils/getRecordsFromRecordConnection';
import { EMPTY_QUERY } from '@/object-record/constants/EmptyQuery';
import { RecordGqlOperationSignature } from '@/object-record/graphql/types/RecordGqlOperationSignature';
import { useGenerateCombinedFindManyRecordsQuery } from '@/object-record/multiple-objects/hooks/useGenerateCombinedFindManyRecordsQuery';
import { MultiObjectRecordQueryResult } from '@/object-record/relation-picker/hooks/useMultiObjectRecordsQueryResultFormattedAsObjectRecordForSelectArray';
import { useEffect, useMemo } from 'react';
import { isDeeplyEqual } from '~/utils/isDeeplyEqual';

export const useCombinedFindManyRecords = ({
  operationSignatures,
  skip = false,
  onDataChange,
}: {
  operationSignatures: RecordGqlOperationSignature[];
  skip?: boolean;
  onDataChange?: (
    data: MultiObjectRecordQueryResult | null | undefined,
  ) => void;
}) => {
  const findManyQuery = useGenerateCombinedFindManyRecordsQuery({
    operationSignatures,
  });

  const { data, loading, previousData } =
    useQuery<MultiObjectRecordQueryResult>(findManyQuery ?? EMPTY_QUERY, {
      skip,
    });

  const resultWithoutConnection = Object.fromEntries(
    Object.entries(data ?? {}).map(([namePlural, objectRecordConnection]) => [
      namePlural,
      getRecordsFromRecordConnection({
        recordConnection: objectRecordConnection,
      }),
    ]),
  );

  const isSameDataAsPreviousData = useMemo(
    () => isDeeplyEqual(previousData, data),
    [previousData, data],
  );

  useEffect(() => {
    if (!isSameDataAsPreviousData) {
      onDataChange?.(data);
    }
  }, [isSameDataAsPreviousData, onDataChange, data]);

  return {
    result: resultWithoutConnection,
    loading,
    isSameDataAsPreviousData,
  };
};
