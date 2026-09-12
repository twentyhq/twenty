export const matchesDatabaseEventTriggerEventName = ({
  batchEventName,
  triggerEventName,
}: {
  batchEventName: string;
  triggerEventName: string;
}): boolean => {
  const [nameSingular, operation] = batchEventName.split('.');

  return [
    `${nameSingular}.${operation}`,
    `*.${operation}`,
    `${nameSingular}.*`,
    '*.*',
  ].includes(triggerEventName);
};
