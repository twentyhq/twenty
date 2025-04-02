import { fixtures } from './fixtures/fixtures';
import { pageviewSchema, eventSchema } from './events';
import { z } from 'zod';

type Event = z.infer<typeof eventSchema>;
type Pageview = z.infer<typeof pageviewSchema>;

const commonProperties = () => ({
  timestamp: new Date().toISOString(),
  version: '1',
});

const makeEvent = (data: Record<string, unknown>): Event => {
  return eventSchema.parse({
    ...data,
    ...commonProperties(),
  });
};

const makePageview = (data: Record<string, unknown>): Pageview => {
  return pageviewSchema.parse({
    ...data,
    ...commonProperties(),
  });
};

export { makeEvent, makePageview, Event, Pageview, fixtures };
