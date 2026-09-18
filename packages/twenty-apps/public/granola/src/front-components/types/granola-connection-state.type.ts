export type GranolaConnectionState =
  | 'CHECKING'
  | 'CONNECTING'
  | 'CONNECTED'
  | 'INVALID_KEY'
  | 'UNREACHABLE'
  | 'PAUSED'
  | 'SETUP_INCOMPLETE';
