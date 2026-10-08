export type OnDemandFieldLoadResult =
  | 'loaded'
  | 'missing'
  | 'forbidden'
  | 'error'
  | 'stale';
