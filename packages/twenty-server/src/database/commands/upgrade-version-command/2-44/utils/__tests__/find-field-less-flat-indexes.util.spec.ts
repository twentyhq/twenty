import { findFieldLessFlatIndexes } from 'src/database/commands/upgrade-version-command/2-44/utils/find-field-less-flat-indexes.util';

const buildFlatIndex = ({
  name,
  fieldCount,
}: {
  name: string;
  fieldCount: number;
}) => ({
  name,
  flatIndexFieldMetadatas: Array.from({ length: fieldCount }, (_, order) => ({
    fieldMetadataId: `${name}-field-${order}`,
    order,
  })),
});

describe('findFieldLessFlatIndexes', () => {
  it('should return indexes that have no index field left', () => {
    const orphan = buildFlatIndex({ name: 'IDX_orphan', fieldCount: 0 });
    const live = buildFlatIndex({ name: 'IDX_live', fieldCount: 1 });

    expect(findFieldLessFlatIndexes({ flatIndexes: [orphan, live] })).toEqual([
      orphan,
    ]);
  });

  it('should skip a field-less index whose name is still used by an index with fields', () => {
    const orphan = buildFlatIndex({ name: 'IDX_shared', fieldCount: 0 });
    const live = buildFlatIndex({ name: 'IDX_shared', fieldCount: 1 });

    expect(findFieldLessFlatIndexes({ flatIndexes: [orphan, live] })).toEqual(
      [],
    );
  });

  it('should return nothing when every index has fields', () => {
    expect(
      findFieldLessFlatIndexes({
        flatIndexes: [buildFlatIndex({ name: 'IDX_live', fieldCount: 2 })],
      }),
    ).toEqual([]);
  });
});
