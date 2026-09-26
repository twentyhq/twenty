import { findFieldLessFlatIndexes } from 'src/database/commands/upgrade-version-command/2-43/utils/find-field-less-flat-indexes.util';
import { type FlatEntityMaps } from 'src/engine/metadata-modules/flat-entity/types/flat-entity-maps.type';
import { type FlatIndexMetadata } from 'src/engine/metadata-modules/flat-index-metadata/types/flat-index-metadata.type';

const buildFlatIndex = ({
  universalIdentifier,
  name,
  fieldCount,
}: {
  universalIdentifier: string;
  name: string;
  fieldCount: number;
}): FlatIndexMetadata =>
  ({
    id: `${universalIdentifier}-id`,
    universalIdentifier,
    name,
    flatIndexFieldMetadatas: Array.from({ length: fieldCount }, (_, order) => ({
      fieldMetadataId: `${universalIdentifier}-field-${order}`,
      order,
    })),
  }) as unknown as FlatIndexMetadata;

const buildFlatIndexMaps = (
  flatIndexes: FlatIndexMetadata[],
): FlatEntityMaps<FlatIndexMetadata> =>
  ({
    byUniversalIdentifier: Object.fromEntries(
      flatIndexes.map((flatIndex) => [flatIndex.universalIdentifier, flatIndex]),
    ),
  }) as unknown as FlatEntityMaps<FlatIndexMetadata>;

describe('findFieldLessFlatIndexes', () => {
  it('should return indexes that have no index field left', () => {
    const orphan = buildFlatIndex({
      universalIdentifier: 'orphan',
      name: 'IDX_orphan',
      fieldCount: 0,
    });
    const live = buildFlatIndex({
      universalIdentifier: 'live',
      name: 'IDX_live',
      fieldCount: 1,
    });

    expect(
      findFieldLessFlatIndexes({
        flatIndexMaps: buildFlatIndexMaps([orphan, live]),
      }),
    ).toEqual([orphan]);
  });

  it('should skip a field-less index whose name is still used by an index with fields', () => {
    const orphan = buildFlatIndex({
      universalIdentifier: 'orphan',
      name: 'IDX_shared',
      fieldCount: 0,
    });
    const live = buildFlatIndex({
      universalIdentifier: 'live',
      name: 'IDX_shared',
      fieldCount: 1,
    });

    expect(
      findFieldLessFlatIndexes({
        flatIndexMaps: buildFlatIndexMaps([orphan, live]),
      }),
    ).toEqual([]);
  });

  it('should return nothing when every index has fields', () => {
    expect(
      findFieldLessFlatIndexes({
        flatIndexMaps: buildFlatIndexMaps([
          buildFlatIndex({
            universalIdentifier: 'live',
            name: 'IDX_live',
            fieldCount: 2,
          }),
        ]),
      }),
    ).toEqual([]);
  });
});
