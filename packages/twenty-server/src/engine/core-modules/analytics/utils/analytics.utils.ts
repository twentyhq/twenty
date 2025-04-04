import { AnalyticsCommonPropertiesType } from 'src/engine/core-modules/analytics/types/common.type';
import { eventSchema } from 'src/engine/core-modules/analytics/utils/event/common/base-schemas';
import { AnalyticsPageview } from 'src/engine/core-modules/analytics/types/pageview.type';
import { pageviewSchema } from 'src/engine/core-modules/analytics/utils/pageview/pageview';
import {
  AnalyticsEventType,
  KnownAnalyticsEventMap,
} from 'src/engine/core-modules/analytics/types/event.type';

const commonProperties = (): Record<AnalyticsCommonPropertiesType, string> => ({
  timestamp: new Date().toISOString(),
  version: '1',
});

// Use this function when you can't properly type the event. Instead prefer makeEvent
const makeUnknownEvent = (data: Record<string, unknown>) => {
  return eventSchema.parse({
    ...data,
    ...commonProperties(),
    ...(data.payload ? { payload: data.payload } : { payload: {} }),
  });
};

const makeEvent = <T extends keyof KnownAnalyticsEventMap>(
  data: AnalyticsEventType<T>,
) => {
  return makeUnknownEvent(data);
};

const makePageview = (data: Record<string, unknown>): AnalyticsPageview => {
  return pageviewSchema.parse({
    ...data,
    ...commonProperties(),
  });
};

export { makeUnknownEvent, makePageview, makeEvent };
