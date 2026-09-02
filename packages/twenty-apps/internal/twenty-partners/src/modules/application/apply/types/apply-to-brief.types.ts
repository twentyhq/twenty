export type ApplyRefusalReason =
  | 'UNAUTHENTICATED'
  | 'NO_PARTNER'
  | 'BAD_REQUEST'
  | 'BRIEF_NOT_OPEN'
  | 'PITCH_TOO_SHORT'
  | 'ALREADY_APPLIED';

// `reason` widens to string because failureResponse answers with a sentence, not a code.
export type ApplyToBriefResult =
  | { ok: true; applicationId: string }
  | { ok: false; reason: ApplyRefusalReason | string };
