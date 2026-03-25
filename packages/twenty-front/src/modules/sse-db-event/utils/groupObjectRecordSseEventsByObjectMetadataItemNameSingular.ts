import { type ObjectRecordEvent } from '~/generated-metadata/graphql';

export const groupObjectRecordSseEventsByObjectMetadataItemNameSingular = ({
  objectRecordEvents,
}: {
  objectRecordEvents: ObjectRecordEvent[];
}) => {
  const objectRecordEventsByObjectMetadataItemNameSingular = new Map<
    string,
    ObjectRecordEvent[]
  >();

  for (const objectRecordEvent of objectRecordEvents) {
    const existingObjectRecordEvents =
      objectRecordEventsByObjectMetadataItemNameSingular.get(
        objectRecordEvent.objectNameSingular,
      ) ?? [];

    objectRecordEventsByObjectMetadataItemNameSingular.set(
      objectRecordEvent.objectNameSingular,
      [...existingObjectRecordEvents, objectRecordEvent],
    );
  }

  return objectRecordEventsByObjectMetadataItemNameSingular;
};
