export type OutboundRequestOutcome =
  | 'success'
  | 'http-error'
  | 'blocked'
  | 'timeout'
  | 'network-error'
  | 'other-error';
