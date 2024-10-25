import { v4 } from 'uuid';

import { ObjectMetadataEntity } from 'src/engine/metadata-modules/object-metadata/object-metadata.entity';
import { ObjectRecordCreateEvent } from 'src/engine/core-modules/event-emitter/types/object-record-create.event';
import { generateFakeValue } from 'src/engine/utils/generate-fake-value';
import { ObjectRecordUpdateEvent } from 'src/engine/core-modules/event-emitter/types/object-record-update.event';
import { ObjectRecordDeleteEvent } from 'src/engine/core-modules/event-emitter/types/object-record-delete.event';
import { ObjectRecordDestroyEvent } from 'src/engine/core-modules/event-emitter/types/object-record-destroy.event';

export const generateFakeObjectRecordEvent = <Entity>(
  objectMetadataEntity: ObjectMetadataEntity,
  action: 'created' | 'updated' | 'deleted' | 'destroyed',
):
  | ObjectRecordCreateEvent<Entity>
  | ObjectRecordUpdateEvent<Entity>
  | ObjectRecordDeleteEvent<Entity>
  | ObjectRecordDestroyEvent<Entity> => {
  const recordId = v4();
  const userId = v4();
  const workspaceMemberId = v4();

  const after = objectMetadataEntity.fields.reduce(
    (acc, field) => {
      acc[field.name] = generateFakeValue(field.type);

      return acc;
    },
    {} as Record<string, any>,
  );

  if (action === 'created') {
    return {
      recordId,
      userId,
      workspaceMemberId,
      objectMetadata: objectMetadataEntity,
      properties: {
        after: after as Entity,
      },
    };
  }

  const before = objectMetadataEntity.fields.reduce(
    (acc, field) => {
      acc[field.name] = generateFakeValue(field.type);

      return acc;
    },
    {} as Record<string, any>,
  );

  if (action === 'updated') {
    return {
      recordId,
      userId,
      workspaceMemberId,
      objectMetadata: objectMetadataEntity,
      properties: {
        updatedFields: objectMetadataEntity.fields.map((f) => f.name),
        before: after as Entity,
        after: before as Entity,
        diff: after as Entity,
      },
    };
  }

  if (action === 'deleted') {
    return {
      recordId,
      userId,
      workspaceMemberId,
      objectMetadata: objectMetadataEntity,
      properties: {
        before: before as Entity,
      },
    };
  }

  if (action === 'destroyed') {
    return {
      recordId,
      userId,
      workspaceMemberId,
      objectMetadata: objectMetadataEntity,
      properties: {
        before: before as Entity,
      },
    };
  }

  throw new Error(`Unknown action '${action}'`);
};
