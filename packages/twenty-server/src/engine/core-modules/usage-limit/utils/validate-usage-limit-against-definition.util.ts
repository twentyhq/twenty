import { isNonEmptyString } from '@sniptt/guards';
import { isDefined, isValidUuid } from 'twenty-shared/utils';

import { type UpsertUsageLimitInput } from 'src/engine/core-modules/usage-limit/dtos/upsert-usage-limit.input';
import {
  UsageLimitException,
  UsageLimitExceptionCode,
} from 'src/engine/core-modules/usage-limit/exceptions/usage-limit.exception';
import { findUsageLimitDefinition } from 'src/engine/core-modules/usage-limit/utils/find-usage-limit-definition.util';

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
      UsageLimitExceptionCode.LIMIT_RULE_INVALID,
    );
  }

  if (
    isDefined(input.operationType) &&
    !definition.allowedOperationTypes.includes(input.operationType)
  ) {
    throw new UsageLimitException(
      `${input.resourceType} ${input.limitKind} limits cannot target the ${input.operationType} operation`,
      UsageLimitExceptionCode.LIMIT_RULE_INVALID,
    );
  }

  if (!definition.allowedSpenderTypes.includes(input.spenderType)) {
    throw new UsageLimitException(
      `${input.resourceType} ${input.limitKind} limits cannot be scoped to ${input.spenderType}`,
      UsageLimitExceptionCode.LIMIT_RULE_INVALID,
    );
  }

  if (isNonEmptyString(input.spenderId) && !isValidUuid(input.spenderId)) {
    throw new UsageLimitException(
      `${input.spenderId} is not a valid ${input.spenderType} id`,
      UsageLimitExceptionCode.LIMIT_RULE_INVALID,
    );
  }

  if (input.limitKind === 'speed') {
    if (input.windowSeconds <= 0) {
      throw new UsageLimitException(
        'A speed limit needs a window longer than zero seconds',
        UsageLimitExceptionCode.LIMIT_RULE_INVALID,
      );
    }

    if (input.limitValueType === 'percent') {
      throw new UsageLimitException(
        'A speed limit cannot be a percentage',
        UsageLimitExceptionCode.LIMIT_RULE_INVALID,
      );
    }
  }

  if (input.limitKind === 'quota') {
    if (input.windowSeconds !== 0) {
      throw new UsageLimitException(
        'A quota spans the whole period and cannot have a window',
        UsageLimitExceptionCode.LIMIT_RULE_INVALID,
      );
    }

    if (isDefined(input.burstValue)) {
      throw new UsageLimitException(
        'A quota cannot hold a burst value',
        UsageLimitExceptionCode.LIMIT_RULE_INVALID,
      );
    }
  }

  if (
    input.limitValueType === 'percent' &&
    (input.limitValue < 1 || input.limitValue > 10000)
  ) {
    throw new UsageLimitException(
      'A percent limit is expressed in basis points, between 1 and 10000',
      UsageLimitExceptionCode.LIMIT_RULE_INVALID,
    );
  }
};
