import { type ApplyRefusalReason } from 'src/modules/application/apply/types/apply-to-brief.types';

export const GENERIC_APPLY_FAILURE_MESSAGE = 'Could not send your application. Try again.';

const REFUSAL_MESSAGES: Record<ApplyRefusalReason, string> = {
  UNAUTHENTICATED: 'Sign in again to apply.',
  NO_PARTNER: 'This account is not linked to a partner.',
  BAD_REQUEST: 'Reopen this brief and try again.',
  BRIEF_NOT_OPEN: 'This brief is no longer open for applications.',
  PITCH_TOO_SHORT: 'Add a little more detail before you apply.',
  ALREADY_APPLIED: 'You have already applied to this brief.',
};

// The route may add a reason the front component does not know yet, so never index blindly.
export const getRefusalMessage = (reason: string): string =>
  REFUSAL_MESSAGES[reason as ApplyRefusalReason] ?? GENERIC_APPLY_FAILURE_MESSAGE;
