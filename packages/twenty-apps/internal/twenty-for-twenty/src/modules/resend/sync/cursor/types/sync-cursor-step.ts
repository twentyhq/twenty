export type SyncCursorStep =
  | 'SEGMENTS'
  | 'TEMPLATES'
  | 'CONTACTS'
  | 'EMAILS'
  | 'BROADCASTS'
  | 'TOPICS';

export type SyncCursorRow = {
  id: string;
  step: SyncCursorStep;
  cursor: string | null;
};
