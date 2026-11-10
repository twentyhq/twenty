export type ViewFamilyLoadOutcome =
  | { type: 'commit'; familyVersion: string }
  | { type: 'confirm-hint'; familyVersion: string }
  | { type: 'mismatch' };
