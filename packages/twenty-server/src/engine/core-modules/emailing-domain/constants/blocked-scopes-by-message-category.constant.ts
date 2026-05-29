import { EmailGroupMessageCategory } from 'src/engine/core-modules/emailing-domain/types/email-group-message-category.type';
import { EmailGroupSuppressionScope } from 'src/engine/core-modules/emailing-domain/types/email-group-suppression-scope.type';

export const BLOCKED_SCOPES_BY_MESSAGE_CATEGORY: Record<
  EmailGroupMessageCategory,
  EmailGroupSuppressionScope[]
> = {
  [EmailGroupMessageCategory.TRANSACTIONAL]: [
    EmailGroupSuppressionScope.GLOBAL,
  ],
  [EmailGroupMessageCategory.CAMPAIGN]: [
    EmailGroupSuppressionScope.GLOBAL,
    EmailGroupSuppressionScope.CAMPAIGN,
  ],
};
