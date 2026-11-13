import {
  type IndexManifest,
  getIndexFieldUniversalIdentifier,
} from 'twenty-shared/application';
import {
  FieldMetadataType,
  IndexType,
  OrderByDirection,
} from 'twenty-shared/types';

import { fromFlatIndexMetadataToIndexManifest } from 'src/engine/core-modules/application/application-manifest/converters/from-flat-index-metadata-to-index-manifest.util';
import { fromIndexManifestToUniversalFlatIndex } from 'src/engine/core-modules/application/application-manifest/converters/from-index-manifest-to-universal-flat-index.util';
import { getFlatFieldMetadataMock } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/get-flat-field-metadata.mock';
import { getFlatObjectMetadataMock } from 'src/engine/metadata-modules/flat-object-metadata/__mocks__/get-flat-object-metadata.mock';
import { compareTwoFlatEntity } from 'src/engine/workspace-manager/workspace-migration/universal-flat-entity/utils/compare-two-universal-flat-entity.util';

const APP_UID = '11111111-1111-4111-8111-111111111111';
const OBJECT_UID = '22222222-2222-4222-8222-222222222222';
const INDEX_UID = '33333333-3333-4333-8333-333333333333';
const TITLE_FIELD_UID = '44444444-4444-4444-8444-444444444444';
const ADDRESS_FIELD_UID = '55555555-5555-4555-8555-555555555555';
const NOW = '2026-09-03T10:00:00.000Z';

const flatObjectMetadata = getFlatObjectMetadataMock({
  universalIdentifier: OBJECT_UID,
  applicationUniversalIdentifier: APP_UID,
  nameSingular: 'pet',
  namePlural: 'pets',
});

const objectFlatFieldMetadatas = [
  getFlatFieldMetadataMock({
    universalIdentifier: TITLE_FIELD_UID,
    objectMetadataId: flatObjectMetadata.id,
    objectMetadataUniversalIdentifier: OBJECT_UID,
    type: FieldMetadataType.TEXT,
    name: 'title',
    label: 'Title',
  }),
  getFlatFieldMetadataMock({
    universalIdentifier: ADDRESS_FIELD_UID,
    objectMetadataId: flatObjectMetadata.id,
    objectMetadataUniversalIdentifier: OBJECT_UID,
    type: FieldMetadataType.ADDRESS,
    name: 'location',
    label: 'Location',
  }),
];

const INDEX_MANIFEST: Required<IndexManifest> = {
  universalIdentifier: INDEX_UID,
  objectUniversalIdentifier: OBJECT_UID,
  indexType: IndexType.BTREE,
  isUnique: true,
  fields: [
    {
      universalIdentifier: getIndexFieldUniversalIdentifier({
        applicationUniversalIdentifier: APP_UID,
        indexUniversalIdentifier: INDEX_UID,
        fieldUniversalIdentifier: ADDRESS_FIELD_UID,
        subFieldName: 'addressCity',
      }),
      fieldUniversalIdentifier: ADDRESS_FIELD_UID,
      subFieldName: 'addressCity',
    },
    {
      universalIdentifier: getIndexFieldUniversalIdentifier({
        applicationUniversalIdentifier: APP_UID,
        indexUniversalIdentifier: INDEX_UID,
        fieldUniversalIdentifier: TITLE_FIELD_UID,
      }),
      fieldUniversalIdentifier: TITLE_FIELD_UID,
    },
  ],
};

const forward = (indexManifest: IndexManifest) =>
  fromIndexManifestToUniversalFlatIndex({
    indexManifest,
    flatObjectMetadata,
    objectFlatFieldMetadatas,
    applicationUniversalIdentifier: APP_UID,
    now: NOW,
  });

describe('fromFlatIndexMetadataToIndexManifest', () => {
  it('should reproduce the manifest after a forward then an inverse conversion', () => {
    expect(
      fromFlatIndexMetadataToIndexManifest({
        flatIndexMetadata: forward(INDEX_MANIFEST),
      }),
    ).toEqual(INDEX_MANIFEST);
  });

  it('should reproduce the flat entity after an inverse then a forward conversion, whatever the stored field order', () => {
    const flatIndexMetadata = forward(INDEX_MANIFEST);
    const shuffledFlatIndexMetadata = {
      ...flatIndexMetadata,
      universalFlatIndexFieldMetadatas: [
        ...flatIndexMetadata.universalFlatIndexFieldMetadatas,
      ].reverse(),
    };

    expect(
      compareTwoFlatEntity({
        fromUniversalFlatEntity: flatIndexMetadata,
        toUniversalFlatEntity: forward(
          fromFlatIndexMetadataToIndexManifest({
            flatIndexMetadata: shuffledFlatIndexMetadata,
          }),
        ),
        metadataName: 'index',
      }),
    ).toBeUndefined();
  });

  it('should keep a field direction through a forward then an inverse conversion', () => {
    const manifestWithDirection: IndexManifest = {
      ...INDEX_MANIFEST,
      isUnique: false,
      fields: [
        {
          ...INDEX_MANIFEST.fields[1],
          direction: OrderByDirection.DescNullsLast,
        },
      ],
    };

    expect(
      fromFlatIndexMetadataToIndexManifest({
        flatIndexMetadata: forward(manifestWithDirection),
      }),
    ).toEqual(manifestWithDirection);
  });

  it('should not see a change between a missing and a null field direction', () => {
    const flatIndexMetadata = forward(INDEX_MANIFEST);
    const flatIndexMetadataWithoutDirection = {
      ...flatIndexMetadata,
      universalFlatIndexFieldMetadatas:
        flatIndexMetadata.universalFlatIndexFieldMetadatas.map(
          ({ direction: _direction, ...indexField }) => indexField,
        ),
    };

    expect(
      compareTwoFlatEntity({
        fromUniversalFlatEntity: flatIndexMetadata,
        toUniversalFlatEntity: flatIndexMetadataWithoutDirection,
        metadataName: 'index',
      }),
    ).toBeUndefined();
  });

  it('should see a change when a field direction changes', () => {
    const titleOnlyManifest: IndexManifest = {
      ...INDEX_MANIFEST,
      isUnique: false,
      fields: [INDEX_MANIFEST.fields[1]],
    };
    const descendingFlatIndexMetadata = forward({
      ...titleOnlyManifest,
      fields: [
        {
          ...titleOnlyManifest.fields[0],
          direction: OrderByDirection.DescNullsLast,
        },
      ],
    });

    const comparison = compareTwoFlatEntity({
      fromUniversalFlatEntity: forward(titleOnlyManifest),
      toUniversalFlatEntity: descendingFlatIndexMetadata,
      metadataName: 'index',
    });

    expect(comparison?.update).toMatchObject({
      name: descendingFlatIndexMetadata.name,
      universalFlatIndexFieldMetadatas: [
        { direction: OrderByDirection.DescNullsLast },
      ],
    });
  });

  it('should write the index type the forward converter defaulted', () => {
    const { indexType: _indexType, ...manifestWithoutIndexType } =
      INDEX_MANIFEST;

    expect(
      fromFlatIndexMetadataToIndexManifest({
        flatIndexMetadata: forward(manifestWithoutIndexType),
      }),
    ).toMatchObject({ indexType: 'BTREE', isUnique: true });
  });
});
