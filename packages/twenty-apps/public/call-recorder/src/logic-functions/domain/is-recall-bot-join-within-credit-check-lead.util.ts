import { MILLISECONDS_PER_MINUTE } from 'src/logic-functions/constants/milliseconds-per-minute';
import { PRE_JOIN_CREDIT_CHECK_LEAD_MINUTES } from 'src/logic-functions/constants/pre-join-credit-check-lead-minutes';

export const isRecallBotJoinWithinCreditCheckLead = ({
  joinAt,
  now,
}: {
  joinAt: string;
  now: Date;
}): boolean =>
  new Date(joinAt).getTime() - now.getTime() <=
  PRE_JOIN_CREDIT_CHECK_LEAD_MINUTES * MILLISECONDS_PER_MINUTE;
