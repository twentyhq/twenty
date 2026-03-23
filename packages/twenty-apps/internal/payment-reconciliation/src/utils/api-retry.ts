import { CoreApiClient } from 'twenty-sdk/clients';

const MAX_RETRIES = 3;
const BASE_RETRY_DELAY_MS = 2000;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const queryWithRetry = async <T>(
  query: Record<string, unknown>,
): Promise<T> => {
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const client = new CoreApiClient();

      return (await client.query(query)) as T;
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);

      if (attempt === MAX_RETRIES) {
        throw new Error(
          `query failed after ${MAX_RETRIES + 1} attempts: ${msg}`,
        );
      }

      const delay =
        BASE_RETRY_DELAY_MS * Math.pow(2, attempt) + Math.random() * 1000;

      console.log(
        `[api-retry] Query attempt ${
          attempt + 1
        } failed (${msg}), retrying in ${Math.round(delay)}ms`,
      );

      await sleep(delay);
    }
  }

  throw new Error('query failed after retries');
};

export const mutationWithRetry = async <T = unknown>(
  mutation: Record<string, unknown>,
): Promise<T> => {
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const client = new CoreApiClient();

      return (await client.mutation(mutation)) as T;
    } catch (error) {
      const msg = error instanceof Error ? error.message : String(error);

      if (attempt === MAX_RETRIES) {
        throw new Error(
          `mutation failed after ${MAX_RETRIES + 1} attempts: ${msg}`,
        );
      }

      const delay =
        BASE_RETRY_DELAY_MS * Math.pow(2, attempt) + Math.random() * 1000;

      console.log(
        `[api-retry] Mutation attempt ${
          attempt + 1
        } failed (${msg}), retrying in ${Math.round(delay)}ms`,
      );

      await sleep(delay);
    }
  }

  throw new Error('mutation failed after retries');
};
