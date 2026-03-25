import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';

import { sortFieldMetadataItem } from '~/utils/sortFieldMetadataItem';

describe('sortFieldMetadataItem', () => {
  it('should return an empty array for an empty array', () => {
    const items: FieldMetadataItem[] = [];
    const sortedItems = items.sort(sortFieldMetadataItem);
    const expectedItems: FieldMetadataItem[] = [];
    expect(sortedItems).toEqual(expectedItems);
  });

  it('should return array with a single item for the same array', () => {
    const item1 = {
      isCustom: false,
      createdAt: '2024-01-03T11:41:16.344Z',
    } as FieldMetadataItem;

    const items: FieldMetadataItem[] = [item1];
    const sortedItems = items.sort(sortFieldMetadataItem);
    const expectedItems: FieldMetadataItem[] = [item1];
    expect(sortedItems).toEqual(expectedItems);
  });

  it('should correctly sort items based on createdAt', () => {
    const item1 = {
      isCustom: false,
      createdAt: '2024-01-03T11:41:16.344Z',
    } as FieldMetadataItem;

    const item2 = {
      isCustom: false,
      createdAt: '2024-01-02T09:41:16.344Z',
    } as FieldMetadataItem;

    const item3 = {
      isCustom: false,
      createdAt: '2024-01-03T09:41:16.344Z',
    } as FieldMetadataItem;

    const items = [item1, item2, item3];
    const sortedItems = items.sort(sortFieldMetadataItem);
    const expectedItems = [item2, item3, item1];

    expect(sortedItems).toEqual(expectedItems);
  });

  it('should correctly sort items based on isCustom and createdAt', () => {
    const item1 = {
      isCustom: false,
      createdAt: '2024-01-03T09:41:16.344Z',
    } as FieldMetadataItem;

    const item2 = {
      isCustom: true,
      createdAt: '2024-01-02T09:41:16.344Z',
    } as FieldMetadataItem;

    const item3 = {
      isCustom: false,
      createdAt: '2024-01-01T09:41:16.344Z',
    } as FieldMetadataItem;

    const item4 = {
      isCustom: true,
      createdAt: '2024-01-04T09:41:16.344Z',
    } as FieldMetadataItem;

    const items = [item1, item2, item3, item4];
    const sortedItems = items.sort(sortFieldMetadataItem);
    const expectedItems = [item3, item1, item2, item4];

    expect(sortedItems).toEqual(expectedItems);
  });

  it('should handle arrays with items missing required properties', () => {
    const item1 = {
      isCustom: false,
      createdAt: '2024-01-03T11:41:16.344Z',
    } as FieldMetadataItem;

    const item2 = {
      // Missing createdAt property
      isCustom: false,
    } as FieldMetadataItem;

    const item3 = {
      // Missing isCustom property
      createdAt: '2024-01-05T11:41:16.344Z',
    } as FieldMetadataItem;

    const items = [item1, item2, item3];
    const sortedItems = items.sort(sortFieldMetadataItem);
    expect(sortedItems).toHaveLength(items.length);
  });
});
