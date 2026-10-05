import { type DatabaseEventTriggerSettings } from 'twenty-shared/application';

import { normalizeDatabaseEventTriggerSettings } from 'src/engine/metadata-modules/logic-function/utils/normalize-database-event-trigger-settings.util';

export const findDatabaseEventTriggersMatchingEventName = ({
  databaseEventTriggerSettings,
  eventName,
}: {
  databaseEventTriggerSettings:
    | DatabaseEventTriggerSettings
    | DatabaseEventTriggerSettings[]
    | null
    | undefined;
  eventName: string;
}): DatabaseEventTriggerSettings[] => {
  const [nameSingular, operation] = eventName.split('.');

  const matchingTriggerEventNames = [
    `${nameSingular}.${operation}`,
    `*.${operation}`,
    `${nameSingular}.*`,
    '*.*',
  ];

  return (
    normalizeDatabaseEventTriggerSettings(databaseEventTriggerSettings) ?? []
  ).filter((triggerSettings) =>
    matchingTriggerEventNames.includes(triggerSettings.eventName),
  );
};
