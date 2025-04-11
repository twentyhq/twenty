import { z } from 'zod';

import { functionExecuteSchema } from 'src/engine/core-modules/analytics/utils/event/function/function-execute';
import { serverlessFunctionExecutedSchema } from 'src/engine/core-modules/analytics/utils/event/serverless-function/serverless-function-executed';
import { webhookResponseSchema } from 'src/engine/core-modules/analytics/utils/event/webhook/webhook-response';
import { eventSchema } from 'src/engine/core-modules/analytics/utils/event/common/base-schemas';
import { AnalyticsCommonPropertiesType } from 'src/engine/core-modules/analytics/types/common.type';

export type AnalyticsEvent = z.infer<typeof eventSchema>;

export type KnownAnalyticsEventMap = {
  'webhook.response': z.infer<typeof webhookResponseSchema>['payload'];
  'function.execute': z.infer<typeof functionExecuteSchema>['payload'];
  'serverlessFunction.executed': z.infer<
    typeof serverlessFunctionExecutedSchema
  >['payload'];
  'customDomain.activated': never;
  'customDomain.deactivated': never;
};

export type AnalyticsEventType<T extends keyof KnownAnalyticsEventMap> =
  KnownAnalyticsEventMap[T] extends never
    ? { action: T }
    : { action: T; payload: KnownAnalyticsEventMap[T] };

export type UnknownAnalyticsEvent = Omit<
  AnalyticsEvent,
  AnalyticsCommonPropertiesType
>;
