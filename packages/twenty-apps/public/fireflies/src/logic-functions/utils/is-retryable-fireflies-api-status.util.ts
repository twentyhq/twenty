// 429 is excluded: rate limits re-enqueue the continuation with a delay instead.
export const isRetryableFirefliesApiStatus = (status: number): boolean =>
  status === 0 || status === 408 || status >= 500;
