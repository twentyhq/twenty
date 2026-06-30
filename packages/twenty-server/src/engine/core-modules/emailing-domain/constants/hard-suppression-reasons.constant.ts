import { MessageSuppressionReason } from 'src/engine/core-modules/emailing-domain/types/message-suppression-reason.type';

export const HARD_SUPPRESSION_REASONS = [
  MessageSuppressionReason.BOUNCE,
  MessageSuppressionReason.COMPLAINT,
];

export const GLOBAL_BLOCKING_SUPPRESSION_REASONS = [
  ...HARD_SUPPRESSION_REASONS,
  MessageSuppressionReason.UNSUBSCRIBE,
];
