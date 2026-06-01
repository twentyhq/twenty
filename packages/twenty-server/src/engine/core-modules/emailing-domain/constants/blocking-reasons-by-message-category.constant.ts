import { EmailGroupMessageCategory } from 'src/engine/core-modules/emailing-domain/types/email-group-message-category.type';
import { EmailGroupSuppressionReason } from 'src/engine/core-modules/emailing-domain/types/email-group-suppression-reason.type';

// Transactional sends ignore unsubscribe (only hard bounces and complaints block them);
// marketing sends additionally honour a global unsubscribe.
export const BLOCKING_REASONS_BY_MESSAGE_CATEGORY: Record<
  EmailGroupMessageCategory,
  EmailGroupSuppressionReason[]
> = {
  [EmailGroupMessageCategory.TRANSACTIONAL]: [
    EmailGroupSuppressionReason.BOUNCE,
    EmailGroupSuppressionReason.COMPLAINT,
  ],
  [EmailGroupMessageCategory.CAMPAIGN]: [
    EmailGroupSuppressionReason.BOUNCE,
    EmailGroupSuppressionReason.COMPLAINT,
    EmailGroupSuppressionReason.UNSUBSCRIBE,
  ],
};
