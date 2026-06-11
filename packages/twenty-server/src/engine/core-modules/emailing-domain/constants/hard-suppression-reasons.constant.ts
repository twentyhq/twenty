import { MessageSuppressionReason } from 'src/engine/core-modules/emailing-domain/types/message-suppression-reason.type';

// Hard suppressions (delivery failures) block every send and take precedence
// over a soft unsubscribe; a recipient cannot opt back into a bounced address.
export const HARD_SUPPRESSION_REASONS = [
  MessageSuppressionReason.BOUNCE,
  MessageSuppressionReason.COMPLAINT,
];
