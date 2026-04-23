import { IndexType } from 'src/engine/metadata-modules/index-metadata/types/indexType.types';
import { getColumnsForIndex } from 'src/engine/twenty-orm/utils/get-default-columns-for-index.util';

describe('getColumnsForIndex', () => {
  it('should return ["deletedAt"] when indexType is undefined', () => {
    const result = getColumnsForIndex();

    expect(result).toEqual(['deletedAt']);
  });

  it('should return an empty array when indexType is IndexType.GIN', () => {
    const result = getColumnsForIndex(IndexType.GIN);

    expect(result).toEqual([]);
  });

  it('should return ["deletedAt"] when indexType is IndexType.BTREE', () => {
    const result = getColumnsForIndex(IndexType.BTREE);

    expect(result).toEqual(['deletedAt']);
  });
});
