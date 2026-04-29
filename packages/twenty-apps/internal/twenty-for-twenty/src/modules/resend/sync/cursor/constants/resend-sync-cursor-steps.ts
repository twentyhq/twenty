import type { SyncCursorStep } from '@modules/resend/sync/cursor/types/sync-cursor-step';

export const RESEND_SYNC_CURSOR_STEPS: ReadonlyArray<SyncCursorStep> = [
  'TOPICS',
  'SEGMENTS',
  'TEMPLATES',
  'CONTACTS',
  'EMAILS',
  'BROADCASTS',
];
