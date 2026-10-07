import { isNonEmptyString } from '@sniptt/guards';
import { isDefined, isNonEmptyArray, isValidUuid } from 'twenty-shared/utils';

import { LIMIT_KIND_RULES } from 'src/engine/core-modules/usage-limit/constants/limit-kind-rules.constant';
import { type CreateUsageLimitInput } from 'src/engine/core-modules/usage-limit/dtos/create-usage-limit.input';
import {
  UsageLimitException,
  UsageLimitExceptionCode,
} from 'src/engine/core-modules/usage-limit/exceptions/usage-limit.exception';
import { buildUsageLimitScope } from 'src/engine/core-modules/usage-limit/utils/build-usage-limit-scope.util';
import { findAllowedUsageLimitUnits } from 'src/engine/core-modules/usage-limit/utils/find-allowed-usage-limit-units.util';
import { findSuppressedUsageLimitDefaults } from 'src/engine/core-modules/usage-limit/utils/find-suppressed-usage-limit-defaults.util';
import { findUsageLimitDefinition } from 'src/engine/core-modules/usage-limit/utils/find-usage-limit-definition.util';
import { UsageOperationType } from 'src/engine/core-modules/usage/enums/usage-operation-type.enum';

export const validateUsageLimitAgainstDefinition = ({
  input,
  isOperator,
}: {
  input: CreateUsageLimitInput;
  isOperator: boolean;
}): void => {
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

  const spansEveryOperation = input.operationType === UsageOperationType.ALL;

  if (
    !spansEveryOperation &&
    !definition.allowedOperations.some(
      (allowedOperation) =>
        allowedOperation.operationType === input.operationType,
    )
  ) {
    // Operators may override a default on an operation the workspace cannot limit, and only at the default's exact scope
    if (
      isOperator &&
      isNonEmptyArray(
        findSuppressedUsageLimitDefaults(buildUsageLimitScope(input)),
      )
    ) {
      return;
    }

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

  if (
    spansEveryOperation &&
    !LIMIT_KIND_RULES[input.limitKind].isAllOperationTypeAllowed
  ) {
    return;
  }

  const allowedUnits = findAllowedUsageLimitUnits({
    limitKind: input.limitKind,
    definition,
    operationType: input.operationType,
  });

  if (!allowedUnits.includes(input.unit)) {
    throw new UsageLimitException(
      spansEveryOperation
        ? `A ${input.unit} quota needs an operation: only credits aggregate across operations`
        : `${input.resourceType} ${input.operationType} ${input.limitKind} limits cannot count ${input.unit}, only ${allowedUnits.join(', ')}`,
      UsageLimitExceptionCode.LIMIT_INVALID,
    );
  }
};
