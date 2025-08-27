import { useQuery } from '@apollo/client';

import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { getRecordsFromRecordConnection } from '@/object-record/cache/utils/getRecordsFromRecordConnection';
import { EMPTY_QUERY } from '@/object-record/constants/EmptyQuery';
import { type RecordGqlOperationSignature } from '@/object-record/graphql/types/RecordGqlOperationSignature';
import { useGenerateCombinedFindManyRecordsQuery } from '@/object-record/multiple-objects/hooks/useGenerateCombinedFindManyRecordsQuery';
import { type CombinedFindManyRecordsQueryResult } from '@/object-record/multiple-objects/types/CombinedFindManyRecordsQueryResult';
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

  const apolloCoreClient = useApolloCoreClient();

  const queryVariables = generateCombinedFindManyRecordsQueryVariables({
    operationSignatures,
  });

  const { data, loading } = useQuery<CombinedFindManyRecordsQueryResult>(
    findManyQuery ?? EMPTY_QUERY,
    {
      skip,
      variables: queryVariables,
      client: apolloCoreClient,
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
