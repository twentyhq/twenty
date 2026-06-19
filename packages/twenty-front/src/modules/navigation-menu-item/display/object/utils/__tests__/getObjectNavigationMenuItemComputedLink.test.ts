import { getObjectNavigationMenuItemComputedLink } from '@/navigation-menu-item/display/object/utils/getObjectNavigationMenuItemComputedLink';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';

const mockObjectMetadataItems: Pick<
  EnrichedObjectMetadataItem,
  'id' | 'namePlural'
>[] = [
  {
    id: 'metadata-1',
    namePlural: 'people',
  },
];

describe('getObjectNavigationMenuItemComputedLink', () => {
  it('should link to the bare object path when no last visited view is provided', () => {
    const result = getObjectNavigationMenuItemComputedLink(
      { targetObjectMetadataId: 'metadata-1' },
      mockObjectMetadataItems,
    );

    expect(result).toBe('/objects/people');
  });

  it('should link to the last visited view when provided', () => {
    const result = getObjectNavigationMenuItemComputedLink(
      { targetObjectMetadataId: 'metadata-1' },
      mockObjectMetadataItems,
      'view-42',
    );

    expect(result).toBe('/objects/people?viewId=view-42');
  });

  it('should return an empty string when the target object metadata is not found', () => {
    const result = getObjectNavigationMenuItemComputedLink(
      { targetObjectMetadataId: 'non-existent-metadata' },
      mockObjectMetadataItems,
      'view-42',
    );

    expect(result).toBe('');
  });
});
