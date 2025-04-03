import { fixtures } from './fixtures/fixtures';
import { pageviewSchema, eventSchema } from './events';
import {
  SpecificEventType,
  EventWithoutCommonKeys,
  Event,
} from './types/event.type';
import { Pageview, PageviewWithoutCommonKeys } from '@/types/pageview.type';
import { CommonPropertiesType } from '@/types/common.type';

const commonProperties = (): Record<CommonPropertiesType, string> => ({
  timestamp: new Date().toISOString(),
  version: '1',
});

// Use this function when you can't properly type the event. Instead prefer makeEvent
const makeUnsafeEvent = (data: Record<string, unknown>) => {
  return eventSchema.parse({
    ...data,
    ...commonProperties(),
    ...(data.payload ? { payload: data.payload } : { payload: '{}' }),
  });
};

const makeEvent = <T extends SpecificEventType>(
  data: Omit<T, CommonPropertiesType>,
): T => {
  return makeUnsafeEvent(data) as T;
};

const makePageview = (data: Record<string, unknown>): Pageview => {
  return pageviewSchema.parse({
    ...data,
    ...commonProperties(),
  });
};

export { makeUnsafeEvent, makePageview, makeEvent, fixtures };

export type {
  SpecificEventType,
  EventWithoutCommonKeys,
  PageviewWithoutCommonKeys,
  Event,
  Pageview,
};
