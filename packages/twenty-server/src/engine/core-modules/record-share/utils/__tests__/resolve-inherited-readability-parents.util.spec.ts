/* @license Enterprise */

import { FieldMetadataType, MetadataReadability } from 'twenty-shared/types';

import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { getFlatFieldMetadataMock } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/get-flat-field-metadata.mock';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { getFlatObjectMetadataMock } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/get-flat-object-metadata.mock';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { resolveInheritedReadabilityParents } from 'src/engine/core-modules/record-share/utils/resolve-inherited-readability-parents.util';

const ATTACHMENT_OBJECT_ID = 'attachment-object-id';
const NOTE_OBJECT_ID = 'note-object-id';
const PERSON_OBJECT_ID = 'person-object-id';
const WORKSPACE_MEMBER_OBJECT_ID = 'workspace-member-object-id';
const TARGET_MORPH_ID = 'target-morph-id';
const OTHER_MORPH_ID = 'other-morph-id';
const NOTE_ATTACHMENTS_FIELD_ID = 'note-attachments-field-id';
const TARGET_NOTE_FIELD_ID = 'target-note-field-id';

const buildManyToOneField = ({
  id,
  name,
  type,
  objectMetadataId,
  relationTargetObjectMetadataId,
  relationTargetFieldMetadataId,
  morphId,
}: {
  id: string;
  name: string;
  type: FieldMetadataType.RELATION | FieldMetadataType.MORPH_RELATION;
  objectMetadataId: string;
  relationTargetObjectMetadataId: string;
  relationTargetFieldMetadataId?: string;
  morphId?: string;
}) =>
  getFlatFieldMetadataMock({
    id,
    name,
    type,
    universalIdentifier: `${id}-universal-identifier`,
    objectMetadataId,
    relationTargetObjectMetadataId,
    relationTargetFieldMetadataId: relationTargetFieldMetadataId ?? null,
    morphId: morphId ?? null,
    settings: {
      relationType: RelationType.MANY_TO_ONE,
      joinColumnName: `${name}Id`,
    },
  } as Parameters<typeof getFlatFieldMetadataMock>[0]);

const targetNoteField = buildManyToOneField({
  id: TARGET_NOTE_FIELD_ID,
  name: 'targetNote',
  type: FieldMetadataType.MORPH_RELATION,
  objectMetadataId: ATTACHMENT_OBJECT_ID,
  relationTargetObjectMetadataId: NOTE_OBJECT_ID,
  relationTargetFieldMetadataId: NOTE_ATTACHMENTS_FIELD_ID,
  morphId: TARGET_MORPH_ID,
});

const targetPersonField = buildManyToOneField({
  id: 'target-person-field-id',
  name: 'targetPerson',
  type: FieldMetadataType.MORPH_RELATION,
  objectMetadataId: ATTACHMENT_OBJECT_ID,
  relationTargetObjectMetadataId: PERSON_OBJECT_ID,
  morphId: TARGET_MORPH_ID,
});

const otherMorphField = buildManyToOneField({
  id: 'other-morph-field-id',
  name: 'otherPerson',
  type: FieldMetadataType.MORPH_RELATION,
  objectMetadataId: ATTACHMENT_OBJECT_ID,
  relationTargetObjectMetadataId: PERSON_OBJECT_ID,
  morphId: OTHER_MORPH_ID,
});

const authorField = buildManyToOneField({
  id: 'author-field-id',
  name: 'author',
  type: FieldMetadataType.RELATION,
  objectMetadataId: ATTACHMENT_OBJECT_ID,
  relationTargetObjectMetadataId: WORKSPACE_MEMBER_OBJECT_ID,
});

const noteAttachmentsField = getFlatFieldMetadataMock({
  id: NOTE_ATTACHMENTS_FIELD_ID,
  name: 'attachments',
  type: FieldMetadataType.RELATION,
  universalIdentifier: `${NOTE_ATTACHMENTS_FIELD_ID}-universal-identifier`,
  objectMetadataId: NOTE_OBJECT_ID,
  relationTargetObjectMetadataId: ATTACHMENT_OBJECT_ID,
  relationTargetFieldMetadataId: TARGET_NOTE_FIELD_ID,
  settings: { relationType: RelationType.ONE_TO_MANY },
} as Parameters<typeof getFlatFieldMetadataMock>[0]);

const nameField = getFlatFieldMetadataMock({
  id: 'name-field-id',
  name: 'name',
  type: FieldMetadataType.TEXT,
  universalIdentifier: 'name-field-id-universal-identifier',
  objectMetadataId: ATTACHMENT_OBJECT_ID,
});

const allFields = [
  targetNoteField,
  targetPersonField,
  otherMorphField,
  authorField,
  noteAttachmentsField,
  nameField,
];

const attachmentFields = allFields.filter(
  (field) => field.objectMetadataId === ATTACHMENT_OBJECT_ID,
);

const buildFlatEntityMaps = <T extends FlatFieldMetadata | FlatObjectMetadata>(
  flatEntities: T[],
): FlatEntityMaps<T> => ({
  byUniversalIdentifier: Object.fromEntries(
    flatEntities.map((flatEntity) => [
      flatEntity.universalIdentifier,
      flatEntity,
    ]),
  ),
  universalIdentifierById: Object.fromEntries(
    flatEntities.map((flatEntity) => [
      flatEntity.id,
      flatEntity.universalIdentifier,
    ]),
  ),
  universalIdentifiersByApplicationId: {},
});

const buildAttachmentObject = (
  readabilityParentFieldUniversalIdentifiers: string[] | null,
) =>
  getFlatObjectMetadataMock({
    id: ATTACHMENT_OBJECT_ID,
    universalIdentifier: 'attachment-object-universal-identifier',
    nameSingular: 'attachment',
    fieldIds: attachmentFields.map((field) => field.id),
    readabilityParentFieldUniversalIdentifiers,
  });

const buildNoteObject = ({
  readability,
  readabilityParentFieldUniversalIdentifiers,
}: {
  readability: MetadataReadability;
  readabilityParentFieldUniversalIdentifiers: string[] | null;
}) =>
  getFlatObjectMetadataMock({
    id: NOTE_OBJECT_ID,
    universalIdentifier: 'note-object-universal-identifier',
    nameSingular: 'note',
    fieldIds: [noteAttachmentsField.id],
    readability,
    readabilityParentFieldUniversalIdentifiers,
  });

const buildObjectMetadataMaps = ({
  noteFlatObjectMetadata = buildNoteObject({
    readability: MetadataReadability.OPEN,
    readabilityParentFieldUniversalIdentifiers: null,
  }),
}: { noteFlatObjectMetadata?: FlatObjectMetadata } = {}) =>
  buildFlatEntityMaps([
    buildAttachmentObject(null),
    noteFlatObjectMetadata,
    getFlatObjectMetadataMock({
      id: PERSON_OBJECT_ID,
      universalIdentifier: 'person-object-universal-identifier',
      nameSingular: 'person',
    }),
    getFlatObjectMetadataMock({
      id: WORKSPACE_MEMBER_OBJECT_ID,
      universalIdentifier: 'workspace-member-object-universal-identifier',
      nameSingular: 'workspaceMember',
    }),
  ]);

const describeParent = (
  parent: ReturnType<typeof resolveInheritedReadabilityParents>[number],
) =>
  parent.kind === 'column'
    ? {
        kind: parent.kind,
        joinColumnName: parent.joinColumnName,
        parentNameSingular: parent.parentFlatObjectMetadata.nameSingular,
      }
    : {
        kind: parent.kind,
        childJoinColumnName: parent.childJoinColumnName,
        childNameSingular: parent.childFlatObjectMetadata.nameSingular,
      };

const resolveForAttachment = (
  readabilityParentFieldUniversalIdentifiers: string[],
) =>
  resolveInheritedReadabilityParents({
    flatObjectMetadata: buildAttachmentObject(
      readabilityParentFieldUniversalIdentifiers,
    ),
    flatFieldMetadataMaps: buildFlatEntityMaps(allFields),
    flatObjectMetadataMaps: buildObjectMetadataMaps(),
  }).map(describeParent);

describe('resolveInheritedReadabilityParents', () => {
  it('should resolve a declared plain relation field to its join column and parent', () => {
    expect(resolveForAttachment([authorField.universalIdentifier])).toEqual([
      {
        kind: 'column',
        joinColumnName: 'authorId',
        parentNameSingular: 'workspaceMember',
      },
    ]);
  });

  it('should expand a declared morph relation field to every field sharing its morph id', () => {
    expect(resolveForAttachment([targetNoteField.universalIdentifier])).toEqual(
      [
        {
          kind: 'column',
          joinColumnName: 'targetNoteId',
          parentNameSingular: 'note',
        },
        {
          kind: 'column',
          joinColumnName: 'targetPersonId',
          parentNameSingular: 'person',
        },
      ],
    );
  });

  it('should resolve a declared one-to-many field to the child object and its join column', () => {
    const noteFlatObjectMetadata = buildNoteObject({
      readability: MetadataReadability.INHERITED,
      readabilityParentFieldUniversalIdentifiers: [
        noteAttachmentsField.universalIdentifier,
      ],
    });

    expect(
      resolveInheritedReadabilityParents({
        flatObjectMetadata: noteFlatObjectMetadata,
        flatFieldMetadataMaps: buildFlatEntityMaps(allFields),
        flatObjectMetadataMaps: buildObjectMetadataMaps({
          noteFlatObjectMetadata,
        }),
      }).map(describeParent),
    ).toEqual([
      {
        kind: 'children',
        childJoinColumnName: 'targetNoteId',
        childNameSingular: 'attachment',
      },
    ]);
  });

  it('should ignore declared fields that are not relations of the object', () => {
    expect(
      resolveForAttachment([
        nameField.universalIdentifier,
        noteAttachmentsField.universalIdentifier,
        'unknown-universal-identifier',
      ]),
    ).toEqual([]);
  });

  it('should resolve nothing when no parent field is declared', () => {
    expect(
      resolveInheritedReadabilityParents({
        flatObjectMetadata: buildAttachmentObject(null),
        flatFieldMetadataMaps: buildFlatEntityMaps(allFields),
        flatObjectMetadataMaps: buildObjectMetadataMaps(),
      }),
    ).toEqual([]);
  });
});
