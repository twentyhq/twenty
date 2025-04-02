import * as eventSchemas from './events';
import { pageviewSchema } from './events';
import { Event, Pageview } from '../types';

const makeEvent = (data: unknown): Event => {
  return eventSchemas.eventSchema.parse(data);
};

const makePageview = (data: unknown): Pageview => {
  return pageviewSchema.parse(data);
};

export { makeEvent, makePageview };
