import { RestApiClient } from 'twenty-client-sdk/rest';
import { asRecord } from '@twentyhq/recall-utils/utils/as-record.util';

export const enqueueSummaryPersistence = async (
  key: string,
  value: unknown,
): Promise<void> => {
  const body = asRecord(
    await new RestApiClient({ runAs: 'application' }).post(
      '/metadata',
      {
        query: `mutation PersistSummary($input: SetAppKeyValueInput!) { enqueueAppKeyValue(input: $input) }`,
        variables: { input: { key, value, scope: 'WORKSPACE' } },
      },
      { signal: AbortSignal.timeout(5_000) },
    ),
  );
  const enqueued = asRecord(body?.data)?.enqueueAppKeyValue;
  if (body?.errors || enqueued !== true)
    throw new Error('Summary persistence queue was not acknowledged.');
};
