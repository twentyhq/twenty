import { isBoolean, isNonEmptyString } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';

import type { ValidationResult } from '@/sdk/define/common/types/define-entity.type';
import type { LooseEnumValues } from '@/sdk/define/common/types/loose-enum-values.type';
import { createValidationResult } from '@/sdk/define/common/utils/create-validation-result';
import type {
  HealthCheckLogicFunctionConfig,
  UserHealthCheckLogicFunctionConfig,
  WorkspaceHealthCheckLogicFunctionConfig,
} from '@/sdk/define/logic-functions/health-check-logic-function-config';

export function defineHealthCheck(
  config: LooseEnumValues<UserHealthCheckLogicFunctionConfig>,
): ValidationResult<LooseEnumValues<UserHealthCheckLogicFunctionConfig>>;
export function defineHealthCheck(
  config: LooseEnumValues<WorkspaceHealthCheckLogicFunctionConfig>,
): ValidationResult<LooseEnumValues<WorkspaceHealthCheckLogicFunctionConfig>>;
export function defineHealthCheck(
  config: LooseEnumValues<HealthCheckLogicFunctionConfig>,
): ValidationResult<LooseEnumValues<HealthCheckLogicFunctionConfig>>;
export function defineHealthCheck(
  config: LooseEnumValues<HealthCheckLogicFunctionConfig>,
) {
  const errors = [];

  if (!isNonEmptyString(config.universalIdentifier)) {
    errors.push('Health check must have a universalIdentifier');
  }

  if (!isDefined(config.handler)) {
    errors.push('Health check must have a handler');
  } else if (typeof config.handler !== 'function') {
    errors.push('Health check handler must be a function');
  }

  if (
    isDefined(config.runOnUserPreferences) &&
    !isBoolean(config.runOnUserPreferences)
  ) {
    errors.push('Health check runOnUserPreferences must be a boolean');
  }

  return createValidationResult({ config, errors });
}
