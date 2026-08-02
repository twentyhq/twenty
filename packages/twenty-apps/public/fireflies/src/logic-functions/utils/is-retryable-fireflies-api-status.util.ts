// 429 is excluded: rate limits pause the sweep and continue via cursor instead.
export const isRetryableFirefliesApiStatus = (status: number): boolean =>
  status === 0 || status === 408 || status >= 500;
