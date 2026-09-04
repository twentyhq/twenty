import { MessageSuppressionReason } from 'src/engine/core-modules/emailing-domain/types/message-suppression-reason.type';

export const HARD_SUPPRESSION_REASONS = [
  MessageSuppressionReason.BOUNCE,
  MessageSuppressionReason.COMPLAINT,
];
