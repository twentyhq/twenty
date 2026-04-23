import { shouldReplaceFilter } from '@/views/utils/shouldReplaceFilter';

describe('shouldReplaceFilter', () => {
  it('should match advanced filters by id', () => {
    const result = shouldReplaceFilter(
      { id: 'f1', fieldMetadataId: 'field-a', recordFilterGroupId: 'g1' },
      { id: 'f1', fieldMetadataId: 'field-b', recordFilterGroupId: 'g1' },
    );

    expect(result).toBe(true);
  });

  it('should not match advanced filters with different ids', () => {
    const result = shouldReplaceFilter(
      { id: 'f1', fieldMetadataId: 'field-a', recordFilterGroupId: 'g1' },
      { id: 'f2', fieldMetadataId: 'field-a', recordFilterGroupId: 'g1' },
    );

    expect(result).toBe(false);
  });

  it('should match simple filters by fieldMetadataId when old filter has no group', () => {
    const result = shouldReplaceFilter(
      { id: 'f1', fieldMetadataId: 'field-a', recordFilterGroupId: undefined },
      { id: 'f2', fieldMetadataId: 'field-a', recordFilterGroupId: undefined },
    );

    expect(result).toBe(true);
  });

  it('should not replace when old filter belongs to a group but new filter does not', () => {
    const result = shouldReplaceFilter(
      { id: 'f1', fieldMetadataId: 'field-a', recordFilterGroupId: 'g1' },
      { id: 'f2', fieldMetadataId: 'field-a', recordFilterGroupId: undefined },
    );

    expect(result).toBe(false);
  });
});
