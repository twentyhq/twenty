import { HARD_SUPPRESSION_REASONS } from 'src/engine/core-modules/emailing-domain/constants/hard-suppression-reasons.constant';
import { EmailGroupMessageCategory } from 'src/engine/core-modules/emailing-domain/types/email-group-message-category.type';
import { MessageSuppressionReason } from 'src/engine/core-modules/emailing-domain/types/message-suppression-reason.type';

// Transactional sends ignore unsubscribe (only hard bounces and complaints block them);
// marketing sends additionally honour a global unsubscribe.
export const BLOCKING_REASONS_BY_MESSAGE_CATEGORY: Record<
  EmailGroupMessageCategory,
  MessageSuppressionReason[]
> = {
  [EmailGroupMessageCategory.TRANSACTIONAL]: HARD_SUPPRESSION_REASONS,
  [EmailGroupMessageCategory.CAMPAIGN]: [
    ...HARD_SUPPRESSION_REASONS,
    MessageSuppressionReason.UNSUBSCRIBE,
  ],
};
