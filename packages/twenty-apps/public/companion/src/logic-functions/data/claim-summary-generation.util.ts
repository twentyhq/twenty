import { RestApiClient } from 'twenty-client-sdk/rest';
import { asRecord } from 'src/logic-functions/utils/as-record.util';

export const claimSummaryGeneration = async (key: string): Promise<boolean> => {
  const body = asRecord(
    await new RestApiClient({ runAs: 'application' }).post(
      '/metadata',
      {
        query: `mutation ClaimSummary($input: SetAppKeyValueInput!) { setAppKeyValueIfAbsent(input: $input) }`,
        variables: {
          input: {
            key,
            value: { status: 'RUNNING', startedAt: new Date().toISOString() },
            scope: 'WORKSPACE',
          },
        },
      },
      { signal: AbortSignal.timeout(5_000) },
    ),
  );
  const claimed = asRecord(body?.data)?.setAppKeyValueIfAbsent;
  if (body?.errors || typeof claimed !== 'boolean')
    throw new Error('Summary claim was not acknowledged.');
  return claimed;
};
