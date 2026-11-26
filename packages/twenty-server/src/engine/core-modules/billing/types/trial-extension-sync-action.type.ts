/* @license Enterprise */

export type TrialExtensionSyncAction =
  | { type: 'NONE' }
  | { type: 'END' }
  | { type: 'START'; endsAt: Date };
