import { BillingExceptionCode } from 'src/engine/core-modules/billing/billing.exception';
import { type UsageRefusal } from 'src/engine/core-modules/billing/types/usage-refusal.type';
import { buildUsageRefusalException } from 'src/engine/core-modules/billing/utils/build-usage-refusal-exception.util';
import { UsageLimitExceptionCode } from 'src/engine/core-modules/usage-limit/exceptions/usage-limit.exception';
import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { UsageResourceType } from 'src/engine/core-modules/usage/enums/usage-resource-type.enum';

const WORKSPACE_ID = 'workspace-1';

const buildException = (usageRefusal: UsageRefusal) =>
  buildUsageRefusalException({ usageRefusal, workspaceId: WORKSPACE_ID });

describe('buildUsageRefusalException', () => {
  it('names the workspace and the reason when the subscription is inactive', () => {
    const exception = buildException({
      kind: 'subscriptionInactive',
      reason: 'NO_SUBSCRIPTION',
    });

    expect(exception.message).toBe(
      `Workspace ${WORKSPACE_ID} has no active subscription: NO_SUBSCRIPTION`,
    );
    expect(exception.code).toBe(
      BillingExceptionCode.BILLING_SUBSCRIPTION_INACTIVE,
    );
    expect(exception.userFriendlyMessage).toBeDefined();
  });

  it('delegates an exhausted quota to the usage limit exception', () => {
    const exception = buildException({
      kind: 'quotaExhausted',
      exhaustedScope: {
        resourceType: UsageResourceType.EMAIL,
        limitKind: 'quota',
        exhaustedKind: 'limit',
        spenderType: 'workspace',
        spenderId: '',
        operationType: UsageOperationType.EMAIL_SEND,
        limitValue: 1000,
        remaining: 0,
        periodCount: 1,
        periodUnit: 'month',
        retryAfterMs: 0,
      },
    });

    expect(exception.code).toBe(UsageLimitExceptionCode.QUOTA_EXHAUSTED);
  });
});
