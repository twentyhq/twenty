import type { DefineEntity } from '@/sdk/define/common/types/define-entity.type';
import { createValidationResult } from '@/sdk/define/common/utils/create-validation-result';
import { type HealthCheckLogicFunctionConfig } from '@/sdk/define/logic-functions/health-check-logic-function-config';

export const defineHealthCheck: DefineEntity<HealthCheckLogicFunctionConfig> = (
  config,
) => {
  const errors = [];

  if (!config.universalIdentifier) {
    errors.push('Health check must have a universalIdentifier');
  }

  if (!config.handler) {
    errors.push('Health check must have a handler');
  } else if (typeof config.handler !== 'function') {
    errors.push('Health check handler must be a function');
  }

  return createValidationResult({
    config,
    errors,
  });
};
