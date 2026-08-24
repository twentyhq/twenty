import { isDefined } from 'twenty-shared/utils';

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

  if (!definition.allowedSpenderTypes.includes(input.spenderType)) {
    throw new UsageLimitException(
      `${input.resourceType} ${input.limitKind} limits cannot be scoped to ${input.spenderType}`,
      UsageLimitExceptionCode.LIMIT_RULE_INVALID,
    );
  }

  if (input.limitKind === 'speed' && input.windowSeconds <= 0) {
    throw new UsageLimitException(
      'A speed limit needs a window longer than zero seconds',
      UsageLimitExceptionCode.LIMIT_RULE_INVALID,
    );
  }
};
