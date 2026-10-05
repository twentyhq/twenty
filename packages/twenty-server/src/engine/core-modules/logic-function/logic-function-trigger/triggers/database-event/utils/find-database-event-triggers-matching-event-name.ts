import { type DatabaseEventTriggerSettings } from 'twenty-shared/application';

export const findDatabaseEventTriggersMatchingEventName = ({
  databaseEventTriggerSettings,
  eventName,
}: {
  databaseEventTriggerSettings:
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

  return (databaseEventTriggerSettings ?? []).filter((triggerSettings) =>
    matchingTriggerEventNames.includes(triggerSettings.eventName),
  );
};
