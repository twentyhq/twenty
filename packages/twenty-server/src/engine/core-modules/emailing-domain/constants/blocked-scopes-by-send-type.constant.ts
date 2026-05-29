import { EmailGroupSendType } from 'src/engine/core-modules/emailing-domain/types/email-group-send-type.type';
import { EmailGroupSuppressionScope } from 'src/engine/core-modules/emailing-domain/types/email-group-suppression-scope.type';

export const BLOCKED_SCOPES_BY_SEND_TYPE: Record<
  EmailGroupSendType,
  EmailGroupSuppressionScope[]
> = {
  [EmailGroupSendType.TRANSACTIONAL]: [EmailGroupSuppressionScope.GLOBAL],
  [EmailGroupSendType.CAMPAIGN]: [
    EmailGroupSuppressionScope.GLOBAL,
    EmailGroupSuppressionScope.CAMPAIGN,
  ],
};
