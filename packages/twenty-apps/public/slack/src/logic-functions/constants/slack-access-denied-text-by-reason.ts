import { SLACK_ACCESS_DENIED_TEXT } from 'src/logic-functions/constants/slack-access-denied-text';
import { SLACK_REQUEST_NOT_ATTRIBUTABLE_TEXT } from 'src/logic-functions/constants/slack-request-not-attributable-text';
import { type SlackAccessDenialReason } from 'src/logic-functions/types/slack-access-denial-reason.type';

export const SLACK_ACCESS_DENIED_TEXT_BY_REASON: Record<
  SlackAccessDenialReason,
  string
> = {
  NOT_A_MEMBER: SLACK_ACCESS_DENIED_TEXT,
  REQUEST_NOT_ATTRIBUTABLE: SLACK_REQUEST_NOT_ATTRIBUTABLE_TEXT,
};
