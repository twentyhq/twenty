/* @license Enterprise */

import { FieldMetadataType, MetadataReadability } from 'twenty-shared/types';

import { RelationType } from 'src/engine/metadata-modules/field-metadata/interfaces/relation-type.interface';

import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { getFlatFieldMetadataMock } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/get-flat-field-metadata.mock';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { getFlatObjectMetadataMock } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/get-flat-object-metadata.mock';
import { type FlatObjectMetadata } from 'src/engine/metadata-modules/flat-object-metadata/types/flat-object-metadata.type';
import { resolveInheritedReadabilityChildLinks } from 'src/engine/core-modules/record-share/utils/resolve-inherited-readability-child-links.util';

const ATTACHMENT_OBJECT_ID = 'attachment-object-id';
const NOTE_OBJECT_ID = 'note-object-id';
const NOTE_ATTACHMENTS_FIELD_ID = 'note-attachments-field-id';
const TARGET_NOTE_FIELD_ID = 'target-note-field-id';

const targetNoteField = getFlatFieldMetadataMock({
  id: TARGET_NOTE_FIELD_ID,
  name: 'targetNote',
  type: FieldMetadataType.MORPH_RELATION,
  universalIdentifier: `${TARGET_NOTE_FIELD_ID}-universal-identifier`,
  objectMetadataId: ATTACHMENT_OBJECT_ID,
  relationTargetObjectMetadataId: NOTE_OBJECT_ID,
  relationTargetFieldMetadataId: NOTE_ATTACHMENTS_FIELD_ID,
  morphId: 'target-morph-id',
  settings: {
    relationType: RelationType.MANY_TO_ONE,
    joinColumnName: 'targetNoteId',
  },
} as Parameters<typeof getFlatFieldMetadataMock>[0]);

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

const attachmentFlatObjectMetadata = getFlatObjectMetadataMock({
  id: ATTACHMENT_OBJECT_ID,
  universalIdentifier: 'attachment-object-universal-identifier',
  nameSingular: 'attachment',
  fieldIds: [targetNoteField.id],
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

const resolveForAttachment = (noteFlatObjectMetadata: FlatObjectMetadata) =>
  resolveInheritedReadabilityChildLinks({
    flatObjectMetadata: attachmentFlatObjectMetadata,
    flatFieldMetadataMaps: buildFlatEntityMaps([
      targetNoteField,
      noteAttachmentsField,
    ]),
    flatObjectMetadataMaps: buildFlatEntityMaps([
      attachmentFlatObjectMetadata,
      noteFlatObjectMetadata,
    ]),
  }).map(({ joinColumnName, parentFlatObjectMetadata }) => ({
    joinColumnName,
    parentNameSingular: parentFlatObjectMetadata.nameSingular,
  }));

describe('resolveInheritedReadabilityChildLinks', () => {
  it('should link a row to the records that inherit through it', () => {
    expect(
      resolveForAttachment(
        buildNoteObject({
          readability: MetadataReadability.INHERITED,
          readabilityParentFieldUniversalIdentifiers: [
            noteAttachmentsField.universalIdentifier,
          ],
        }),
      ),
    ).toEqual([{ joinColumnName: 'targetNoteId', parentNameSingular: 'note' }]);
  });

  it('should link nothing when the pointed record does not inherit through the row', () => {
    expect(
      resolveForAttachment(
        buildNoteObject({
          readability: MetadataReadability.OPEN,
          readabilityParentFieldUniversalIdentifiers: null,
        }),
      ),
    ).toEqual([]);
  });
});
