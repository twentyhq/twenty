import { type MissingSystemRelationIndex } from 'src/database/commands/upgrade-version-command/2-42/utils/build-missing-system-relation-indexes.util';
import { findFieldlessIndexesNamedLikeMissingIndexes } from 'src/database/commands/upgrade-version-command/2-42/utils/find-fieldless-indexes-named-like-missing-indexes.util';
import { createEmptyFlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/constant/create-empty-flat-entity-maps.constant';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { addFlatEntityToFlatEntityMapsOrThrow } from 'src/engine/metadata-modules/flat-entity/utils/add-flat-entity-to-flat-entity-maps-or-throw.util';
import { getFlatIndexMetadataMock } from 'src/engine/metadata-modules/flat-index-metadata/__mocks__/get-flat-index-metadata.mock';
import {
  type FlatIndexFieldMetadata,
  type FlatIndexMetadata,
} from 'src/engine/metadata-modules/flat-index-metadata/types/flat-index-metadata.type';

const INDEX_FIELD: FlatIndexFieldMetadata = {
  id: 'index-field-id',
  indexMetadataId: 'index-with-field',
  fieldMetadataId: 'field-id',
  order: 0,
  subFieldName: null,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
  workspaceId: 'workspace-id',
};

const buildFlatIndex = ({
  id,
  name,
  flatIndexFieldMetadatas = [],
}: {
  id: string;
  name: string;
  flatIndexFieldMetadatas?: FlatIndexFieldMetadata[];
}): FlatIndexMetadata =>
  getFlatIndexMetadataMock({
    id,
    name,
    universalIdentifier: `uid-${id}`,
    objectMetadataId: 'object-timelineActivity',
    objectMetadataUniversalIdentifier: 'uid-object-timelineActivity',
    applicationUniversalIdentifier: 'uid-standard-application',
    flatIndexFieldMetadatas,
  });

const buildFlatIndexMaps = (
  flatIndexes: FlatIndexMetadata[],
): FlatEntityMaps<FlatIndexMetadata> =>
  flatIndexes.reduce<FlatEntityMaps<FlatIndexMetadata>>(
    (flatEntityMaps, flatEntity) =>
      addFlatEntityToFlatEntityMapsOrThrow({ flatEntity, flatEntityMaps }),
    createEmptyFlatEntityMaps(),
  );

const buildMissingIndex = (name: string) =>
  ({ universalFlatIndexMetadata: { name } }) as MissingSystemRelationIndex;

describe('findFieldlessIndexesNamedLikeMissingIndexes', () => {
  it('returns an index without fields whose name matches a missing index, ignoring case', () => {
    const fieldlessIndexes = findFieldlessIndexesNamedLikeMissingIndexes({
      flatIndexMaps: buildFlatIndexMaps([
        buildFlatIndex({
          id: 'fieldless',
          name: 'idx_391f4690884ee39d42b28d5efd0',
        }),
      ]),
      missingIndexes: [buildMissingIndex('IDX_391f4690884ee39d42b28d5efd0')],
    });

    expect(fieldlessIndexes.map(({ id }) => id)).toEqual(['fieldless']);
  });

  it('keeps indexes that still have fields and fieldless indexes with other names', () => {
    const fieldlessIndexes = findFieldlessIndexesNamedLikeMissingIndexes({
      flatIndexMaps: buildFlatIndexMaps([
        buildFlatIndex({
          id: 'index-with-field',
          name: 'IDX_391f4690884ee39d42b28d5efd0',
          flatIndexFieldMetadatas: [INDEX_FIELD],
        }),
        buildFlatIndex({ id: 'other-fieldless', name: 'IDX_other' }),
      ]),
      missingIndexes: [buildMissingIndex('IDX_391f4690884ee39d42b28d5efd0')],
    });

    expect(fieldlessIndexes).toEqual([]);
  });
});
