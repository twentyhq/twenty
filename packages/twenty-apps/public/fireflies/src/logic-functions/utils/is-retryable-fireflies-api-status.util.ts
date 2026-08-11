export const isRetryableFirefliesApiStatus = (status: number): boolean =>
  status === 0 || status === 408 || status === 429 || status >= 500;
