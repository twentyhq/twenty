export type HttpEgressOutcome =
  | 'success'
  | 'http_error'
  | 'blocked'
  | 'timeout'
  | 'network_error'
  | 'payload_too_large'
  | 'invalid_request'
  | 'rate_limited'
  | 'suspended';
