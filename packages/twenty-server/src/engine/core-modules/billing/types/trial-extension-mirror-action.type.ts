/* @license Enterprise */

export type TrialExtensionMirrorAction =
  | { type: 'NONE' }
  | { type: 'END' }
  | { type: 'START'; endsAt: Date };
