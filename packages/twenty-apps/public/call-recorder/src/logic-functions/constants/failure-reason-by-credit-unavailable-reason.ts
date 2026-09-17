import { type CreditUnavailableReason } from 'src/logic-functions/types/credit-unavailable-reason.type';

export const FAILURE_REASON_BY_CREDIT_UNAVAILABLE_REASON: Record<
  CreditUnavailableReason,
  string
> = {
  'no-credits': 'workspace_out_of_credits',
  'no-subscription': 'workspace_without_subscription',
  'workspace-suspended': 'workspace_suspended',
};
