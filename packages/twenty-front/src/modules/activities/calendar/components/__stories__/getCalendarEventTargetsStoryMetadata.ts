import { isDefined } from 'twenty-shared/utils';
import { preloadMockedMetadata } from '~/testing/utils/preloadMockedMetadata';

const CALENDAR_EVENT_TARGET_IDS = {
  object: '20202020-0000-4000-8000-00000000c100',
  identifier: '20202020-0000-4000-8000-00000000c101',
  source: '20202020-0000-4000-8000-00000000c102',
  target: '20202020-0000-4000-8000-00000000c103',
  collection: '20202020-0000-4000-8000-00000000c104',
};

export const getCalendarEventTargetsStoryMetadata = async () => {
  const metadata = await preloadMockedMetadata();
  const calendarEvent = metadata.flatObjects.find(
    ({ nameSingular }) => nameSingular === 'calendarEvent',
  );
  const noteTarget = metadata.flatObjects.find(
    ({ nameSingular }) => nameSingular === 'noteTarget',
  );
  const note = metadata.flatObjects.find(
    ({ nameSingular }) => nameSingular === 'note',
  );

  if (!isDefined(calendarEvent) || !isDefined(noteTarget) || !isDefined(note)) {
    throw new Error(
      'Calendar target story metadata is missing its source objects',
    );
  }

  const identifier = metadata.flatFields.find(
    ({ id }) => id === noteTarget.labelIdentifierFieldMetadataId,
  );
  const source = metadata.flatFields.find(
    ({ objectMetadataId, name }) =>
      objectMetadataId === noteTarget.id && name === 'note',
  );
  const target = metadata.flatFields.find(
    ({ objectMetadataId, name }) =>
      objectMetadataId === noteTarget.id && name === 'target',
  );
  const collection = metadata.flatFields.find(
    ({ objectMetadataId, name }) =>
      objectMetadataId === note.id && name === 'noteTargets',
  );

  if (
    !isDefined(identifier) ||
    !isDefined(source?.relation) ||
    !isDefined(target?.morphRelations) ||
    !isDefined(collection?.relation)
  ) {
    throw new Error(
      'Calendar target story metadata is missing its junction fields',
    );
  }

  const junctionObject = {
    ...noteTarget,
    id: CALENDAR_EVENT_TARGET_IDS.object,
    nameSingular: 'calendarEventTarget',
    namePlural: 'calendarEventTargets',
    labelSingular: 'Calendar event target',
    labelPlural: 'Calendar event targets',
    labelIdentifierFieldMetadataId: CALENDAR_EVENT_TARGET_IDS.identifier,
  };
  const collectionField = {
    id: CALENDAR_EVENT_TARGET_IDS.collection,
    name: 'calendarEventTargets',
  };
  const sourceField = {
    id: CALENDAR_EVENT_TARGET_IDS.source,
    name: 'calendarEvent',
  };
  const targetField = {
    id: CALENDAR_EVENT_TARGET_IDS.target,
    name: 'target',
  };

  return {
    ...metadata,
    flatObjects: [...metadata.flatObjects, junctionObject],
    flatFields: [
      ...metadata.flatFields,
      {
        ...identifier,
        id: CALENDAR_EVENT_TARGET_IDS.identifier,
        objectMetadataId: junctionObject.id,
      },
      {
        ...source,
        ...sourceField,
        objectMetadataId: junctionObject.id,
        settings: { ...source.settings, joinColumnName: 'calendarEventId' },
        relation: {
          ...source.relation,
          sourceObjectMetadata: junctionObject,
          sourceFieldMetadata: sourceField,
          targetObjectMetadata: calendarEvent,
          targetFieldMetadata: collectionField,
        },
      },
      {
        ...target,
        ...targetField,
        objectMetadataId: junctionObject.id,
        morphRelations: target.morphRelations
          .filter(({ targetObjectMetadata }) =>
            ['person', 'company'].includes(targetObjectMetadata.nameSingular),
          )
          .map((relation) => ({
            ...relation,
            sourceObjectMetadata: junctionObject,
            sourceFieldMetadata: targetField,
          })),
      },
      {
        ...collection,
        ...collectionField,
        objectMetadataId: calendarEvent.id,
        settings: {
          ...collection.settings,
          junctionTargetFieldId: targetField.id,
        },
        relation: {
          ...collection.relation,
          sourceObjectMetadata: calendarEvent,
          sourceFieldMetadata: collectionField,
          targetObjectMetadata: junctionObject,
          targetFieldMetadata: sourceField,
        },
      },
    ],
  };
};
