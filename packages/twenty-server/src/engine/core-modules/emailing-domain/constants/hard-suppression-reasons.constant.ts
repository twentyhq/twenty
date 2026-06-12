import { MessageSuppressionReason } from 'src/engine/core-modules/emailing-domain/types/message-suppression-reason.type';

// Hard suppressions (delivery failures) block every send and take precedence
// over a soft unsubscribe; a recipient cannot opt back into a bounced address.
export const HARD_SUPPRESSION_REASONS = [
  MessageSuppressionReason.BOUNCE,
  MessageSuppressionReason.COMPLAINT,
];

// Every email sent through the emailing domain (SES) honours unsubscribe on top
// of the hard suppressions — there is no transactional/marketing distinction.
export const GLOBAL_BLOCKING_SUPPRESSION_REASONS = [
  ...HARD_SUPPRESSION_REASONS,
  MessageSuppressionReason.UNSUBSCRIBE,
];
