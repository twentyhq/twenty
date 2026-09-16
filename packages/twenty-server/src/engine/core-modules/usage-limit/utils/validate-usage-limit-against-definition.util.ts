import { isNonEmptyString } from '@sniptt/guards';
import { isDefined, isValidUuid } from 'twenty-shared/utils';

import { type CreateUsageLimitInput } from 'src/engine/core-modules/usage-limit/dtos/create-usage-limit.input';
import {
  UsageLimitException,
  UsageLimitExceptionCode,
} from 'src/engine/core-modules/usage-limit/exceptions/usage-limit.exception';
import { type UsageMeter } from 'src/engine/core-modules/usage-limit/types/usage-meter.type';
import { findUsageLimitDefinition } from 'src/engine/core-modules/usage-limit/utils/find-usage-limit-definition.util';
import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';

export const validateUsageLimitAgainstDefinition = (
  input: CreateUsageLimitInput,
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

  if ('allowedMeters' in definition) {
    const allowedMeters: readonly UsageMeter[] = definition.allowedMeters;

    if (!allowedMeters.includes(input.meter)) {
      throw new UsageLimitException(
        `${input.resourceType} ${input.limitKind} limits cannot be metered on ${input.meter}`,
        UsageLimitExceptionCode.LIMIT_INVALID,
      );
    }
  }
};
