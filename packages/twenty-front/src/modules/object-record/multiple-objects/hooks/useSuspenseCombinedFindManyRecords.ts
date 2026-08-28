import { skipToken, useSuspenseQuery } from '@apollo/client/react';
import { useMemo } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { getRecordsFromRecordConnection } from '@/object-record/cache/utils/getRecordsFromRecordConnection';
import { useGenerateCombinedFindManyRecordsQuery } from '@/object-record/multiple-objects/hooks/useGenerateCombinedFindManyRecordsQuery';
import { type CombinedFindManyRecordsQueryResult } from '@/object-record/multiple-objects/types/CombinedFindManyRecordsQueryResult';
import { generateCombinedFindManyRecordsQueryVariables } from '@/object-record/multiple-objects/utils/generateCombinedFindManyRecordsQueryVariables';
import { EMPTY_QUERY } from '@/object-record/constants/EmptyQuery';
import { type RecordGqlOperationSignature } from 'twenty-shared/types';

export const useSuspenseCombinedFindManyRecords = ({
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

  const queryVariables = useMemo(
    () =>
      generateCombinedFindManyRecordsQueryVariables({
        operationSignatures,
      }),
    [operationSignatures],
  );

  const { data } = useSuspenseQuery<CombinedFindManyRecordsQueryResult>(
    findManyQuery ?? EMPTY_QUERY,
    skip || !isDefined(findManyQuery)
      ? skipToken
      : {
          variables: queryVariables,
          errorPolicy: 'all',
          client: apolloCoreClient,
        },
  );

  const resultWithoutConnection = useMemo(
    () =>
      Object.fromEntries(
        Object.entries(data ?? {}).map(
          ([namePlural, objectRecordConnection]) => [
            namePlural,
            getRecordsFromRecordConnection({
              recordConnection: objectRecordConnection,
            }),
          ],
        ),
      ),
    [data],
  );

  return {
    result: resultWithoutConnection,
  };
};
