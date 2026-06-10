import { EmailGroupMessageCategory } from 'src/engine/core-modules/emailing-domain/types/email-group-message-category.type';
import { MessageSuppressionReason } from 'src/engine/core-modules/emailing-domain/types/message-suppression-reason.type';

// Transactional sends ignore unsubscribe (only hard bounces and complaints block them);
// marketing sends additionally honour a global unsubscribe.
export const BLOCKING_REASONS_BY_MESSAGE_CATEGORY: Record<
  EmailGroupMessageCategory,
  MessageSuppressionReason[]
> = {
  [EmailGroupMessageCategory.TRANSACTIONAL]: [
    MessageSuppressionReason.BOUNCE,
    MessageSuppressionReason.COMPLAINT,
  ],
  [EmailGroupMessageCategory.CAMPAIGN]: [
    MessageSuppressionReason.BOUNCE,
    MessageSuppressionReason.COMPLAINT,
    MessageSuppressionReason.UNSUBSCRIBE,
  ],
};
