export type LogConsoleResourceView =
  | { type: 'list' }
  | { type: 'new' }
  | { type: 'detail'; id: string };
