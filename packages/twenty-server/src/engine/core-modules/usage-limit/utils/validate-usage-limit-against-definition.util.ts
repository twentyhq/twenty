import { isNonEmptyString } from '@sniptt/guards';
import { isDefined, isValidUuid } from 'twenty-shared/utils';

import { type UpsertUsageLimitInput } from 'src/engine/core-modules/usage-limit/dtos/upsert-usage-limit.input';
import {
  UsageLimitException,
  UsageLimitExceptionCode,
} from 'src/engine/core-modules/usage-limit/exceptions/usage-limit.exception';
import { findUsageLimitDefinition } from 'src/engine/core-modules/usage-limit/utils/find-usage-limit-definition.util';
import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';

export const validateUsageLimitAgainstDefinition = (
  input: UpsertUsageLimitInput,
): void => {
  const definition = findUsageLimitDefinition({
    resourceType: input.resourceType,
    limitKind: input.limitKind,
  });

  if (!isDefined(definition)) {
    throw new UsageLimitException(
      `No ${input.limitKind} limit is defined for ${input.resourceType}`,
      UsageLimitExceptionCode.LIMIT_INVALID,
    );
  }

  if (
    input.operationType !== UsageOperationType.ALL &&
    !definition.allowedOperationTypes.includes(input.operationType)
  ) {
    throw new UsageLimitException(
      `${input.resourceType} ${input.limitKind} limits cannot target the ${input.operationType} operation`,
      UsageLimitExceptionCode.LIMIT_INVALID,
    );
  }

  if (!definition.allowedSpenderTypes.includes(input.spenderType)) {
    throw new UsageLimitException(
      `${input.resourceType} ${input.limitKind} limits cannot be scoped to ${input.spenderType}`,
      UsageLimitExceptionCode.LIMIT_INVALID,
    );
  }

  if (isNonEmptyString(input.spenderId) && !isValidUuid(input.spenderId)) {
    throw new UsageLimitException(
      `${input.spenderId} is not a valid ${input.spenderType} id`,
      UsageLimitExceptionCode.LIMIT_INVALID,
    );
  }

  if (input.limitValueType === 'allowancePercent') {
    if (input.limitKind !== 'quota') {
      throw new UsageLimitException(
        'Only a quota can be expressed as a percent of the allowance',
        UsageLimitExceptionCode.LIMIT_INVALID,
      );
    }

    if (input.periodUnit !== 'allowancePeriod') {
      throw new UsageLimitException(
        'A percent of the allowance is only defined over the allowance period',
        UsageLimitExceptionCode.LIMIT_INVALID,
      );
    }

    if (input.meter !== 'creditsUsedMicro') {
      throw new UsageLimitException(
        'A percent of the allowance is metered on credits',
        UsageLimitExceptionCode.LIMIT_INVALID,
      );
    }

    if (input.limitValue > 100) {
      throw new UsageLimitException(
        'A percent of the allowance cannot exceed 100',
        UsageLimitExceptionCode.LIMIT_INVALID,
      );
    }
  }

  if (input.limitKind === 'speed') {
    if (input.periodUnit !== 'second') {
      throw new UsageLimitException(
        'A speed limit needs a rolling window expressed in seconds',
        UsageLimitExceptionCode.LIMIT_INVALID,
      );
    }

    if (input.meter !== 'quantity') {
      throw new UsageLimitException(
        'A speed limit counts requests, so it is metered on quantity',
        UsageLimitExceptionCode.LIMIT_INVALID,
      );
    }
  }

  if (input.limitKind === 'quota') {
    if (input.periodUnit === 'second') {
      throw new UsageLimitException(
        'A quota anchors to a calendar period, not a rolling window',
        UsageLimitExceptionCode.LIMIT_INVALID,
      );
    }

    if (input.periodCount !== 1) {
      throw new UsageLimitException(
        'A quota covers exactly one period',
        UsageLimitExceptionCode.LIMIT_INVALID,
      );
    }

    if (isDefined(input.burstValue)) {
      throw new UsageLimitException(
        'A quota cannot hold a burst value',
        UsageLimitExceptionCode.LIMIT_INVALID,
      );
    }

    if (
      'allowedMeters' in definition &&
      !definition.allowedMeters.includes(input.meter)
    ) {
      throw new UsageLimitException(
        `${input.resourceType} quotas cannot be metered on ${input.meter}`,
        UsageLimitExceptionCode.LIMIT_INVALID,
      );
    }

    if (
      input.meter === 'quantity' &&
      input.operationType === UsageOperationType.ALL
    ) {
      throw new UsageLimitException(
        'A quantity quota needs an operation: only credits aggregate across operations',
        UsageLimitExceptionCode.LIMIT_INVALID,
      );
    }
  }
};
