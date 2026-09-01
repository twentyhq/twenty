import { upsertMorphItem } from '@/object-record/record-picker/multiple-record-picker/utils/upsertMorphItem';

describe('upsertMorphItem', () => {
  it('replaces stale search state with the authoritative created item', () => {
    const createdItem = {
      recordId: 'new-record-id',
      objectMetadataId: 'object-metadata-id',
      isSelected: true,
      isMatchingSearchFilter: true,
    };

    expect(
      upsertMorphItem([{ ...createdItem, isSelected: false }], createdItem),
    ).toEqual([createdItem]);
  });
});
