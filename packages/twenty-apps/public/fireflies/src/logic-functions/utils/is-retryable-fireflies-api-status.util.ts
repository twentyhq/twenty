// 429 is excluded from inline API retries: rate limits abort the batch so it can be retried later.
export const isRetryableFirefliesApiStatus = (status: number): boolean =>
  status === 0 || status === 408 || status >= 500;
