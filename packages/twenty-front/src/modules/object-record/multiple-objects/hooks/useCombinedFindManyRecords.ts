import { useQuery } from '@apollo/client';

import { getRecordsFromRecordConnection } from '@/object-record/cache/utils/getRecordsFromRecordConnection';
import { EMPTY_QUERY } from '@/object-record/constants/EmptyQuery';
import { RecordGqlOperationSignature } from '@/object-record/graphql/types/RecordGqlOperationSignature';
import { useGenerateCombinedFindManyRecordsQuery } from '@/object-record/multiple-objects/hooks/useGenerateCombinedFindManyRecordsQuery';
import { CombinedFindManyRecordsQueryResult } from '@/object-record/multiple-objects/types/CombinedFindManyRecordsQueryResult';
import { generateCombinedFindManyRecordsQueryVariables } from '@/object-record/multiple-objects/utils/generateCombinedFindManyRecordsQueryVariables';

export const useCombinedFindManyRecords = ({
  operationSignatures,
  skip = false,
}: {
  operationSignatures: RecordGqlOperationSignature[];
  skip?: boolean;
}) => {
  const findManyQuery = useGenerateCombinedFindManyRecordsQuery({
    operationSignatures,
  });

  const queryVariables = generateCombinedFindManyRecordsQueryVariables({
    operationSignatures,
  });

  const { data, loading } = useQuery<CombinedFindManyRecordsQueryResult>(
    findManyQuery ?? EMPTY_QUERY,
    {
      skip,
      variables: queryVariables,
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
    loading,
  };
};
