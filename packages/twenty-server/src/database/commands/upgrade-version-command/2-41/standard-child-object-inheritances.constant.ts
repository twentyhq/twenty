import {
  STANDARD_OBJECT_FIELDS,
  STANDARD_OBJECTS,
} from 'twenty-shared/metadata';
import {
  type ObjectAccessInheritance,
  ObjectAccessInheritanceMatch,
  type ObjectAccessInheritanceRelationRef,
  ObjectAccessInheritanceRelationKind,
} from 'twenty-shared/types';

export const morphRef = (morphId: string): ObjectAccessInheritanceRelationRef => ({
  kind: ObjectAccessInheritanceRelationKind.MORPH,
  morphId,
});

const fieldRef = (
  fieldUniversalIdentifier: string,
): ObjectAccessInheritanceRelationRef => ({
  kind: ObjectAccessInheritanceRelationKind.FIELD,
  fieldUniversalIdentifier,
});

const anyOf = (
  ref: ObjectAccessInheritanceRelationRef,
): ObjectAccessInheritance => ({
  match: ObjectAccessInheritanceMatch.ANY,
  through: [ref],
});

export const STANDARD_CHILD_OBJECT_INHERITANCES = [
  {
    nameSingular: 'attachment',
    universalIdentifier: STANDARD_OBJECTS.attachment.universalIdentifier,
    inheritance: anyOf(
      morphRef(STANDARD_OBJECTS.attachment.morphIds.targetMorphId.morphId),
    ),
  },
  {
    nameSingular: 'timelineActivity',
    universalIdentifier: STANDARD_OBJECTS.timelineActivity.universalIdentifier,
    inheritance: anyOf(
      morphRef(STANDARD_OBJECTS.timelineActivity.morphIds.targetMorphId.morphId),
    ),
  },
  {
    nameSingular: 'noteTarget',
    universalIdentifier: STANDARD_OBJECTS.noteTarget.universalIdentifier,
    inheritance: anyOf(
      fieldRef(STANDARD_OBJECT_FIELDS.noteTarget.note.universalIdentifier),
    ),
  },
  {
    nameSingular: 'taskTarget',
    universalIdentifier: STANDARD_OBJECTS.taskTarget.universalIdentifier,
    inheritance: anyOf(
      fieldRef(STANDARD_OBJECT_FIELDS.taskTarget.task.universalIdentifier),
    ),
  },
  {
    nameSingular: 'messageThreadTarget',
    universalIdentifier:
      STANDARD_OBJECTS.messageThreadTarget.universalIdentifier,
    inheritance: anyOf(
      fieldRef(
        STANDARD_OBJECT_FIELDS.messageThreadTarget.messageThread
          .universalIdentifier,
      ),
    ),
  },
  {
    nameSingular: 'calendarEventTarget',
    universalIdentifier:
      STANDARD_OBJECTS.calendarEventTarget.universalIdentifier,
    inheritance: anyOf(
      fieldRef(
        STANDARD_OBJECT_FIELDS.calendarEventTarget.calendarEvent
          .universalIdentifier,
      ),
    ),
  },
] as const;

