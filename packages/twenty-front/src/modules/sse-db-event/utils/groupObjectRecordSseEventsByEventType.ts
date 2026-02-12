import {
  type DatabaseEventAction,
  type ObjectRecordEvent,
} from '~/generated-metadata/graphql';

export const groupObjectRecordSseEventsByEventType = ({
  objectRecordEvents,
}: {
  objectRecordEvents: ObjectRecordEvent[];
}) => {
  const objectRecordEventsByEventType = new Map<
    DatabaseEventAction,
    ObjectRecordEvent[]
  >();

  for (const objectRecordEvent of objectRecordEvents) {
    const existingObjectRecordEvents =
      objectRecordEventsByEventType.get(objectRecordEvent.action) ?? [];

    objectRecordEventsByEventType.set(objectRecordEvent.action, [
      ...existingObjectRecordEvents,
      objectRecordEvent,
    ]);
  }

  return { objectRecordEventsByEventType };
};
