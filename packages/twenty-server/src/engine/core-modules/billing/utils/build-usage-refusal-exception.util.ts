import {
  BillingException,
  BillingExceptionCode,
} from 'src/engine/core-modules/billing/billing.exception';
import { SUBSCRIPTION_INACTIVE_REASON_USER_FRIENDLY_MESSAGE } from 'src/engine/core-modules/billing/constants/subscription-inactive-reason-user-friendly-message.constant';
import { type UsageRefusal } from 'src/engine/core-modules/billing/types/usage-refusal.type';
import { type UsageLimitException } from 'src/engine/core-modules/usage-limit/exceptions/usage-limit.exception';
import { buildQuotaExhaustedException } from 'src/engine/core-modules/usage-limit/utils/build-quota-exhausted-exception.util';

export const buildUsageRefusalException = ({
  usageRefusal,
  workspaceId,
}: {
  usageRefusal: UsageRefusal;
  workspaceId: string;
}): BillingException | UsageLimitException => {
  if (usageRefusal.kind === 'subscriptionInactive') {
    return new BillingException(
      `Workspace ${workspaceId} has no active subscription: ${usageRefusal.reason}`,
      BillingExceptionCode.BILLING_SUBSCRIPTION_INACTIVE,
      {
        userFriendlyMessage:
          SUBSCRIPTION_INACTIVE_REASON_USER_FRIENDLY_MESSAGE[
            usageRefusal.reason
          ],
      },
    );
  }

  return buildQuotaExhaustedException(usageRefusal.exhaustedScope);
};
