import { EmailGroupSuppressionReason } from 'src/engine/core-modules/emailing-domain/types/email-group-suppression-reason.type';
import { EmailGroupSuppressionScope } from 'src/engine/core-modules/emailing-domain/types/email-group-suppression-scope.type';

export const SUPPRESSION_SCOPE_BY_REASON: Record<
  EmailGroupSuppressionReason,
  EmailGroupSuppressionScope
> = {
  [EmailGroupSuppressionReason.HARD_BOUNCE]: EmailGroupSuppressionScope.GLOBAL,
  [EmailGroupSuppressionReason.COMPLAINT]: EmailGroupSuppressionScope.GLOBAL,
  [EmailGroupSuppressionReason.UNSUBSCRIBE]:
    EmailGroupSuppressionScope.CAMPAIGN,
};
