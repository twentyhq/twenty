import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';

import { sortFieldMetadataItem } from '~/utils/sortFieldMetadataItem';

const WORKSPACE_CUSTOM_APPLICATION_ID = 'workspace-custom-application-id';
const STANDARD_APPLICATION_ID = 'standard-application-id';

const sortByCustomThenCreatedAt = (
  a: FieldMetadataItem,
  b: FieldMetadataItem,
) => sortFieldMetadataItem(a, b, WORKSPACE_CUSTOM_APPLICATION_ID);

describe('sortFieldMetadataItem', () => {
  it('should return an empty array for an empty array', () => {
    const items: FieldMetadataItem[] = [];
    const sortedItems = items.sort(sortByCustomThenCreatedAt);
    const expectedItems: FieldMetadataItem[] = [];
    expect(sortedItems).toEqual(expectedItems);
  });

  it('should return array with a single item for the same array', () => {
    const item1 = {
      applicationId: STANDARD_APPLICATION_ID,
      createdAt: '2024-01-03T11:41:16.344Z',
    } as FieldMetadataItem;

    const items: FieldMetadataItem[] = [item1];
    const sortedItems = items.sort(sortByCustomThenCreatedAt);
    const expectedItems: FieldMetadataItem[] = [item1];
    expect(sortedItems).toEqual(expectedItems);
  });

  it('should correctly sort items based on createdAt', () => {
    const item1 = {
      applicationId: STANDARD_APPLICATION_ID,
      createdAt: '2024-01-03T11:41:16.344Z',
    } as FieldMetadataItem;

    const item2 = {
      applicationId: STANDARD_APPLICATION_ID,
      createdAt: '2024-01-02T09:41:16.344Z',
    } as FieldMetadataItem;

    const item3 = {
      applicationId: STANDARD_APPLICATION_ID,
      createdAt: '2024-01-03T09:41:16.344Z',
    } as FieldMetadataItem;

    const items = [item1, item2, item3];
    const sortedItems = items.sort(sortByCustomThenCreatedAt);
    const expectedItems = [item2, item3, item1];

    expect(sortedItems).toEqual(expectedItems);
  });

  it('should correctly sort items based on isCustom and createdAt', () => {
    const item1 = {
      applicationId: STANDARD_APPLICATION_ID,
      createdAt: '2024-01-03T09:41:16.344Z',
    } as FieldMetadataItem;

    const item2 = {
      applicationId: WORKSPACE_CUSTOM_APPLICATION_ID,
      createdAt: '2024-01-02T09:41:16.344Z',
    } as FieldMetadataItem;

    const item3 = {
      applicationId: STANDARD_APPLICATION_ID,
      createdAt: '2024-01-01T09:41:16.344Z',
    } as FieldMetadataItem;

    const item4 = {
      applicationId: WORKSPACE_CUSTOM_APPLICATION_ID,
      createdAt: '2024-01-04T09:41:16.344Z',
    } as FieldMetadataItem;

    const items = [item1, item2, item3, item4];
    const sortedItems = items.sort(sortByCustomThenCreatedAt);
    const expectedItems = [item3, item1, item2, item4];

    expect(sortedItems).toEqual(expectedItems);
  });

  it('should handle arrays with items missing required properties', () => {
    const item1 = {
      applicationId: STANDARD_APPLICATION_ID,
      createdAt: '2024-01-03T11:41:16.344Z',
    } as FieldMetadataItem;

    const item2 = {
      applicationId: STANDARD_APPLICATION_ID,
    } as FieldMetadataItem;

    const item3 = {
      createdAt: '2024-01-05T11:41:16.344Z',
    } as FieldMetadataItem;

    const items = [item1, item2, item3];
    const sortedItems = items.sort(sortByCustomThenCreatedAt);
    expect(sortedItems).toHaveLength(items.length);
  });
});
