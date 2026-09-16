import { isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

import { LIMIT_KIND_RULES } from 'src/engine/core-modules/usage-limit/constants/limit-kind-rules.constant';
import { type CreateUsageLimitInput } from 'src/engine/core-modules/usage-limit/dtos/create-usage-limit.input';
import {
  UsageLimitException,
  UsageLimitExceptionCode,
} from 'src/engine/core-modules/usage-limit/exceptions/usage-limit.exception';
import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';

export const validateUsageLimitAgainstKindRule = (
  input: CreateUsageLimitInput,
): void => {
  const rule = LIMIT_KIND_RULES[input.limitKind];

  if (!isDefined(rule)) {
    throw new UsageLimitException(
      `No rule describes what a ${input.limitKind} limit may hold`,
      UsageLimitExceptionCode.LIMIT_INVALID,
    );
  }

  const spansEveryOperation = input.operationType === UsageOperationType.ALL;

  if (!rule.isAllOperationTypeAllowed && spansEveryOperation) {
    throw new UsageLimitException(
      `A ${input.limitKind} limit targets a single operation, not ${UsageOperationType.ALL}`,
      UsageLimitExceptionCode.LIMIT_INVALID,
    );
  }

  if (!rule.allowedPeriodUnits.includes(input.periodUnit)) {
    throw new UsageLimitException(
      `A ${input.limitKind} limit cannot run on a ${input.periodUnit} period, only on ${rule.allowedPeriodUnits.join(', ')}`,
      UsageLimitExceptionCode.LIMIT_INVALID,
    );
  }

  if (
    isDefined(rule.requiredPeriodCount) &&
    input.periodCount !== rule.requiredPeriodCount
  ) {
    throw new UsageLimitException(
      `A ${input.limitKind} limit covers exactly ${rule.requiredPeriodCount} period, not ${input.periodCount}`,
      UsageLimitExceptionCode.LIMIT_INVALID,
    );
  }

  if (!rule.allowedMeters.includes(input.meter)) {
    throw new UsageLimitException(
      `A ${input.limitKind} limit cannot be metered on ${input.meter}, only on ${rule.allowedMeters.join(', ')}`,
      UsageLimitExceptionCode.LIMIT_INVALID,
    );
  }

  if (!rule.isBurstValueAllowed && isDefined(input.burstValue)) {
    throw new UsageLimitException(
      `A ${input.limitKind} limit cannot hold a burst value`,
      UsageLimitExceptionCode.LIMIT_INVALID,
    );
  }

  if (
    input.limitKind === 'quota' &&
    input.meter === 'quantity' &&
    spansEveryOperation
  ) {
    throw new UsageLimitException(
      'A quantity quota needs an operation: only credits aggregate across operations',
      UsageLimitExceptionCode.LIMIT_INVALID,
    );
  }

  if (
    input.limitKind === 'stock' &&
    input.spenderType !== 'workspace' &&
    !isNonEmptyString(input.spenderId)
  ) {
    throw new UsageLimitException(
      `A ${input.spenderType} stock needs the ${input.spenderType} it caps`,
      UsageLimitExceptionCode.LIMIT_INVALID,
    );
  }
};
