import { BillingExceptionCode } from 'src/engine/core-modules/billing/billing.exception';
import { SUBSCRIPTION_INACTIVE_REASON_USER_FRIENDLY_MESSAGE } from 'src/engine/core-modules/billing/constants/subscription-inactive-reason-user-friendly-message.constant';
import { type SubscriptionInactiveReason } from 'src/engine/core-modules/billing/types/subscription-inactive-reason.type';
import { type UsageRefusal } from 'src/engine/core-modules/billing/types/usage-refusal.type';
import { buildUsageRefusalException } from 'src/engine/core-modules/billing/utils/build-usage-refusal-exception.util';
import { isUsageRefusedError } from 'src/engine/core-modules/billing/utils/is-usage-refused-error.util';
import { UsageLimitExceptionCode } from 'src/engine/core-modules/usage-limit/exceptions/usage-limit.exception';
import { type ExhaustedKind } from 'src/engine/core-modules/usage-limit/types/exhausted-kind.type';
import { type ExhaustedScope } from 'src/engine/core-modules/usage-limit/types/exhausted-scope.type';
import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';
import { UsageResourceType } from 'src/engine/core-modules/usage/enums/usage-resource-type.enum';

const WORKSPACE_ID = 'workspace-1';

const buildException = (usageRefusal: UsageRefusal) =>
  buildUsageRefusalException({ usageRefusal, workspaceId: WORKSPACE_ID });

const buildExhaustedScope = (
  overrides: Partial<ExhaustedScope> = {},
): ExhaustedScope => ({
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
  ...overrides,
});

const EXHAUSTED_SCOPE_BY_EXHAUSTED_KIND: Record<ExhaustedKind, ExhaustedScope> =
  {
    limit: buildExhaustedScope({ exhaustedKind: 'limit' }),
    allowance: buildExhaustedScope({ exhaustedKind: 'allowance' }),
  };

const USAGE_REFUSALS_BY_KIND: Record<UsageRefusal['kind'], UsageRefusal[]> = {
  subscriptionInactive: (
    Object.keys(
      SUBSCRIPTION_INACTIVE_REASON_USER_FRIENDLY_MESSAGE,
    ) as SubscriptionInactiveReason[]
  ).map((reason) => ({ kind: 'subscriptionInactive', reason })),
  quotaExhausted: Object.values(EXHAUSTED_SCOPE_BY_EXHAUSTED_KIND).map(
    (exhaustedScope) => ({ kind: 'quotaExhausted', exhaustedScope }),
  ),
};

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
      exhaustedScope: buildExhaustedScope(),
    });

    expect(exception.code).toBe(UsageLimitExceptionCode.QUOTA_EXHAUSTED);
  });

  it.each(Object.values(USAGE_REFUSALS_BY_KIND).flat())(
    'builds a $kind refusal that isUsageRefusedError still recognizes',
    (usageRefusal) => {
      expect(isUsageRefusedError(buildException(usageRefusal))).toBe(true);
    },
  );
});
