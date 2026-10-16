import { APPLICATION_MONITORING_EVENTS } from 'twenty-shared/application';

import { LOG_CONSOLE_APPLICATION_EVENTS } from '@/log-console/constants/LogConsoleApplicationEvents';
import { type EventLogRecord } from '~/generated-metadata/graphql';

export const getLogConsoleApplicationEvent = (entry: EventLogRecord) => {
  const event = APPLICATION_MONITORING_EVENTS.find(
    (eventType) => eventType === entry.properties?.eventType,
  );
  return event ? LOG_CONSOLE_APPLICATION_EVENTS[event] : undefined;
};
