import { FieldMetadataType } from 'twenty-shared/types';

import { isSearchVectorGinFlatIndexMetadata } from 'src/database/commands/upgrade-version-command/2-20/utils/is-search-vector-gin-flat-index-metadata.util';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { getFlatFieldMetadataMock } from 'src/engine/metadata-modules/flat-field-metadata/__mocks__/get-flat-field-metadata.mock';
import { type FlatFieldMetadata } from 'src/engine/metadata-modules/flat-field-metadata/types/flat-field-metadata.type';
import { getFlatIndexMetadataMock } from 'src/engine/metadata-modules/flat-index-metadata/__mocks__/get-flat-index-metadata.mock';
import { type FlatIndexFieldMetadata } from 'src/engine/metadata-modules/flat-index-metadata/types/flat-index-metadata.type';
import { IndexType } from 'src/engine/metadata-modules/index-metadata/types/indexType.types';
import { SEARCH_VECTOR_FIELD } from 'src/engine/metadata-modules/search-field-metadata/constants/search-vector-field.constants';

const buildFlatFieldMetadataMaps = (
  flatFieldMetadatas: FlatFieldMetadata[],
): FlatEntityMaps<FlatFieldMetadata> => ({
  byUniversalIdentifier: Object.fromEntries(
    flatFieldMetadatas.map((flatFieldMetadata) => [
      flatFieldMetadata.universalIdentifier,
      flatFieldMetadata,
    ]),
  ),
  universalIdentifierById: Object.fromEntries(
    flatFieldMetadatas.map((flatFieldMetadata) => [
      flatFieldMetadata.id,
      flatFieldMetadata.universalIdentifier,
    ]),
  ),
  universalIdentifiersByApplicationId: {},
});

const buildFlatIndexFieldMetadata = ({
  fieldMetadataId,
}: {
  fieldMetadataId: string;
}): FlatIndexFieldMetadata => {
  const createdAt = '2024-01-01T00:00:00.000Z';

  return {
    id: `${fieldMetadataId}-index-field-id`,
    workspaceId: 'workspace-id',
    indexMetadataId: 'index-metadata-id',
    fieldMetadataId,
    order: 0,
    subFieldName: null,
    createdAt,
    updatedAt: createdAt,
  };
};

const SEARCH_VECTOR_FIELD_ID = 'search-vector-field-id';
const TEXT_FIELD_ID = 'text-field-id';
const OTHER_TS_VECTOR_FIELD_ID = 'other-ts-vector-field-id';

const searchVectorFlatFieldMetadata = getFlatFieldMetadataMock({
  id: SEARCH_VECTOR_FIELD_ID,
  universalIdentifier: 'search-vector-field-uid',
  objectMetadataId: 'object-id',
  type: FieldMetadataType.TS_VECTOR,
  name: SEARCH_VECTOR_FIELD.name,
});

const textFlatFieldMetadata = getFlatFieldMetadataMock({
  id: TEXT_FIELD_ID,
  universalIdentifier: 'text-field-uid',
  objectMetadataId: 'object-id',
  type: FieldMetadataType.TEXT,
  name: 'name',
});

const otherTsVectorFlatFieldMetadata = getFlatFieldMetadataMock({
  id: OTHER_TS_VECTOR_FIELD_ID,
  universalIdentifier: 'other-ts-vector-field-uid',
  objectMetadataId: 'object-id',
  type: FieldMetadataType.TS_VECTOR,
  name: 'customSearchVector',
});

const flatFieldMetadataMaps = buildFlatFieldMetadataMaps([
  searchVectorFlatFieldMetadata,
  textFlatFieldMetadata,
  otherTsVectorFlatFieldMetadata,
]);

describe('isSearchVectorGinFlatIndexMetadata', () => {
  it('returns true for a single-field GIN index on the TS_VECTOR field', () => {
    const flatIndexMetadata = getFlatIndexMetadataMock({
      universalIdentifier: 'gin-index-uid',
      objectMetadataId: 'object-id',
      objectMetadataUniversalIdentifier: 'object-uid',
      applicationUniversalIdentifier: 'application-uid',
      indexType: IndexType.GIN,
      flatIndexFieldMetadatas: [
        buildFlatIndexFieldMetadata({ fieldMetadataId: SEARCH_VECTOR_FIELD_ID }),
      ],
    });

    expect(
      isSearchVectorGinFlatIndexMetadata({
        flatIndexMetadata,
        flatFieldMetadataMaps,
      }),
    ).toBe(true);
  });

  it('returns false for a GIN index on a non-TS_VECTOR field', () => {
    const flatIndexMetadata = getFlatIndexMetadataMock({
      universalIdentifier: 'gin-index-uid',
      objectMetadataId: 'object-id',
      objectMetadataUniversalIdentifier: 'object-uid',
      applicationUniversalIdentifier: 'application-uid',
      indexType: IndexType.GIN,
      flatIndexFieldMetadatas: [
        buildFlatIndexFieldMetadata({ fieldMetadataId: TEXT_FIELD_ID }),
      ],
    });

    expect(
      isSearchVectorGinFlatIndexMetadata({
        flatIndexMetadata,
        flatFieldMetadataMaps,
      }),
    ).toBe(false);
  });

  it('returns false for a non-GIN (BTREE) index on the TS_VECTOR field', () => {
    const flatIndexMetadata = getFlatIndexMetadataMock({
      universalIdentifier: 'btree-index-uid',
      objectMetadataId: 'object-id',
      objectMetadataUniversalIdentifier: 'object-uid',
      applicationUniversalIdentifier: 'application-uid',
      indexType: IndexType.BTREE,
      flatIndexFieldMetadatas: [
        buildFlatIndexFieldMetadata({ fieldMetadataId: SEARCH_VECTOR_FIELD_ID }),
      ],
    });

    expect(
      isSearchVectorGinFlatIndexMetadata({
        flatIndexMetadata,
        flatFieldMetadataMaps,
      }),
    ).toBe(false);
  });

  it('returns false for a single-field GIN index on a TS_VECTOR field that is not the searchVector field', () => {
    const flatIndexMetadata = getFlatIndexMetadataMock({
      universalIdentifier: 'gin-index-uid',
      objectMetadataId: 'object-id',
      objectMetadataUniversalIdentifier: 'object-uid',
      applicationUniversalIdentifier: 'application-uid',
      indexType: IndexType.GIN,
      flatIndexFieldMetadatas: [
        buildFlatIndexFieldMetadata({
          fieldMetadataId: OTHER_TS_VECTOR_FIELD_ID,
        }),
      ],
    });

    expect(
      isSearchVectorGinFlatIndexMetadata({
        flatIndexMetadata,
        flatFieldMetadataMaps,
      }),
    ).toBe(false);
  });

  it('returns false for a multi-column GIN index', () => {
    const flatIndexMetadata = getFlatIndexMetadataMock({
      universalIdentifier: 'gin-index-uid',
      objectMetadataId: 'object-id',
      objectMetadataUniversalIdentifier: 'object-uid',
      applicationUniversalIdentifier: 'application-uid',
      indexType: IndexType.GIN,
      flatIndexFieldMetadatas: [
        buildFlatIndexFieldMetadata({ fieldMetadataId: SEARCH_VECTOR_FIELD_ID }),
        buildFlatIndexFieldMetadata({ fieldMetadataId: TEXT_FIELD_ID }),
      ],
    });

    expect(
      isSearchVectorGinFlatIndexMetadata({
        flatIndexMetadata,
        flatFieldMetadataMaps,
      }),
    ).toBe(false);
  });
});
