import { type BillingException } from 'src/engine/core-modules/billing/billing.exception';
import { isUsageRefusedError } from 'src/engine/core-modules/billing/utils/is-usage-refused-error.util';
import { ServerRouteTriggerException } from 'src/engine/core-modules/server-route-trigger/exceptions/server-route-trigger.exception';
import { type UsageLimitException } from 'src/engine/core-modules/usage-limit/exceptions/usage-limit.exception';

export const isAppFacingServerRouteError = (
  error: unknown,
): error is
  | ServerRouteTriggerException
  | BillingException
  | UsageLimitException =>
  error instanceof ServerRouteTriggerException || isUsageRefusedError(error);
