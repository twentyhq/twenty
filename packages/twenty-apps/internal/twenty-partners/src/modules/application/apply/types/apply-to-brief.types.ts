import { type PITCHABLE_STATES } from 'src/modules/application/apply/constants/apply-to-brief.constants';

export type ApplyRefusalReason =
  | 'UNAUTHENTICATED'
  | 'NO_PARTNER'
  | 'BAD_REQUEST'
  | 'BRIEF_NOT_OPEN'
  | 'PITCH_TOO_SHORT'
  | 'ALREADY_APPLIED';

export type PitchableState = (typeof PITCHABLE_STATES)[number];
