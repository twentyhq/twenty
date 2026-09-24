import { upsertMorphItem } from '@/object-record/record-picker/multiple-record-picker/utils/upsertMorphItem';

describe('upsertMorphItem', () => {
  const createdItem = {
    recordId: 'new-record-id',
    objectMetadataId: 'object-metadata-id',
    isSelected: true,
    isMatchingSearchFilter: true,
  };

  it('replaces stale search state without changing its sorted position', () => {
    const firstItem = {
      ...createdItem,
      recordId: 'first-record-id',
    };

    expect(
      upsertMorphItem(
        [firstItem, { ...createdItem, isSelected: false }],
        createdItem,
      ),
    ).toEqual([firstItem, createdItem]);
  });

  it('prepends a missing selected item', () => {
    const existingItem = {
      ...createdItem,
      recordId: 'existing-record-id',
      isSelected: false,
    };

    expect(upsertMorphItem([existingItem], createdItem)).toEqual([
      createdItem,
      existingItem,
    ]);
  });
});
