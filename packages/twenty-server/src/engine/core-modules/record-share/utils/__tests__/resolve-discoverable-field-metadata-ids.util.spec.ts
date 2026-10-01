/* @license Enterprise */

import { FieldMetadataType, MetadataReadability } from 'twenty-shared/types';

import { resolveDiscoverableFieldMetadataIds } from 'src/engine/core-modules/record-share/utils/resolve-discoverable-field-metadata-ids.util';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { getFlatFieldMetadataMock } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/get-flat-field-metadata.mock';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { getFlatObjectMetadataMock } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/get-flat-object-metadata.mock';

const OBJECT_METADATA_ID = 'thread-target-object-id';
const MORPH_ID = 'target-morph-id';

const buildField = ({
  id,
  name,
  type = FieldMetadataType.TEXT,
  morphId = null,
}: {
  id: string;
  name: string;
  type?: FieldMetadataType;
  morphId?: string | null;
}) =>
  getFlatFieldMetadataMock({
    id,
    universalIdentifier: `${id}-universal-identifier`,
    objectMetadataId: OBJECT_METADATA_ID,
    type,
    name,
    morphId,
  });

const fields = [
  buildField({ id: 'id-field', name: 'id', type: FieldMetadataType.UUID }),
  buildField({
    id: 'created-at-field',
    name: 'createdAt',
    type: FieldMetadataType.DATE_TIME,
  }),
  buildField({
    id: 'created-by-field',
    name: 'createdBy',
    type: FieldMetadataType.ACTOR,
  }),
  buildField({
    id: 'updated-at-field',
    name: 'updatedAt',
    type: FieldMetadataType.DATE_TIME,
  }),
  buildField({ id: 'subject-field', name: 'subject' }),
  buildField({
    id: 'target-person-field',
    name: 'targetPerson',
    type: FieldMetadataType.MORPH_RELATION,
    morphId: MORPH_ID,
  }),
  buildField({
    id: 'target-custom-field',
    name: 'targetRocket',
    type: FieldMetadataType.MORPH_RELATION,
    morphId: MORPH_ID,
  }),
];

const flatFieldMetadataMaps: FlatEntityMaps<FlatFieldMetadata> = {
  byUniversalIdentifier: Object.fromEntries(
    fields.map((field) => [field.universalIdentifier, field]),
  ),
  universalIdentifierById: Object.fromEntries(
    fields.map((field) => [field.id, field.universalIdentifier]),
  ),
  universalIdentifiersByApplicationId: {},
};

const buildObject = ({
  readability,
  discoverableFieldUniversalIdentifiers,
}: {
  readability: MetadataReadability;
  discoverableFieldUniversalIdentifiers: string[] | null;
}) =>
  getFlatObjectMetadataMock({
    id: OBJECT_METADATA_ID,
    universalIdentifier: 'thread-target-universal-identifier',
    readability,
    discoverableFieldUniversalIdentifiers,
    fieldIds: fields.map((field) => field.id),
  });

describe('resolveDiscoverableFieldMetadataIds', () => {
  it('returns nothing for an object that takes no part in existence reads', () => {
    expect(
      resolveDiscoverableFieldMetadataIds({
        flatObjectMetadata: buildObject({
          readability: MetadataReadability.PRIVATE,
          discoverableFieldUniversalIdentifiers: null,
        }),
        flatFieldMetadataMaps,
      }),
    ).toBeUndefined();
  });

  it('ignores fields declared on an object that is neither discoverable nor inherited', () => {
    expect(
      resolveDiscoverableFieldMetadataIds({
        flatObjectMetadata: buildObject({
          readability: MetadataReadability.PRIVATE,
          discoverableFieldUniversalIdentifiers: [
            'target-person-field-universal-identifier',
          ],
        }),
        flatFieldMetadataMaps,
      }),
    ).toBeUndefined();
  });

  it('lets a DISCOVERABLE object be discovered by id, createdAt and createdBy alone', () => {
    expect(
      resolveDiscoverableFieldMetadataIds({
        flatObjectMetadata: buildObject({
          readability: MetadataReadability.DISCOVERABLE,
          discoverableFieldUniversalIdentifiers: null,
        }),
        flatFieldMetadataMaps,
      }),
    ).toEqual(new Set(['id-field', 'created-at-field', 'created-by-field']));
  });

  it('adds a declared regular field and leaves undeclared fields out', () => {
    expect(
      resolveDiscoverableFieldMetadataIds({
        flatObjectMetadata: buildObject({
          readability: MetadataReadability.DISCOVERABLE,
          discoverableFieldUniversalIdentifiers: [
            'subject-field-universal-identifier',
          ],
        }),
        flatFieldMetadataMaps,
      }),
    ).toEqual(
      new Set(['id-field', 'created-at-field', 'created-by-field', 'subject-field']),
    );
  });

  it('adds the declared fields and every target of a declared morph relation', () => {
    expect(
      resolveDiscoverableFieldMetadataIds({
        flatObjectMetadata: buildObject({
          readability: MetadataReadability.INHERITED,
          discoverableFieldUniversalIdentifiers: [
            'target-person-field-universal-identifier',
          ],
        }),
        flatFieldMetadataMaps,
      }),
    ).toEqual(
      new Set([
        'id-field',
        'created-at-field',
        'created-by-field',
        'target-person-field',
        'target-custom-field',
      ]),
    );
  });
});
