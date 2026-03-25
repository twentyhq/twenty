import { NavigationMenuItemType } from 'twenty-shared/types';
import { getObjectMetadataForNavigationMenuItem } from '@/navigation-menu-item/display/object/utils/getObjectMetadataForNavigationMenuItem';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type View } from '@/views/types/View';

const mockObjectMetadataItems: EnrichedObjectMetadataItem[] = [
  {
    id: 'metadata-1',
    nameSingular: 'person',
    namePlural: 'people',
  } as EnrichedObjectMetadataItem,
  {
    id: 'metadata-2',
    nameSingular: 'company',
    namePlural: 'companies',
  } as EnrichedObjectMetadataItem,
];

const mockViews: View[] = [
  {
    id: 'view-1',
    objectMetadataId: 'metadata-1',
  } as View,
  {
    id: 'view-2',
    objectMetadataId: 'metadata-2',
  } as View,
];

describe('getObjectMetadataForNavigationMenuItem', () => {
  it('should return null for link item type', () => {
    const result = getObjectMetadataForNavigationMenuItem(
      { type: NavigationMenuItemType.LINK },
      mockObjectMetadataItems,
      mockViews,
    );
    expect(result).toBeNull();
  });

  it('should return object metadata for view item when view and metadata exist', () => {
    const result = getObjectMetadataForNavigationMenuItem(
      { type: NavigationMenuItemType.VIEW, viewId: 'view-1' },
      mockObjectMetadataItems,
      mockViews,
    );
    expect(result).toEqual(mockObjectMetadataItems[0]);
    expect(result?.nameSingular).toBe('person');
  });

  it('should return null for view item when view is not found', () => {
    const result = getObjectMetadataForNavigationMenuItem(
      { type: NavigationMenuItemType.VIEW, viewId: 'non-existent-view' },
      mockObjectMetadataItems,
      mockViews,
    );
    expect(result).toBeNull();
  });

  it('should return null for view item when view has no matching object metadata', () => {
    const viewsWithOrphanView: View[] = [
      { id: 'orphan-view', objectMetadataId: 'non-existent-metadata' } as View,
    ];
    const result = getObjectMetadataForNavigationMenuItem(
      { type: NavigationMenuItemType.VIEW, viewId: 'orphan-view' },
      mockObjectMetadataItems,
      viewsWithOrphanView,
    );
    expect(result).toBeNull();
  });

  it('should return object metadata for record item when metadata exists', () => {
    const result = getObjectMetadataForNavigationMenuItem(
      {
        type: NavigationMenuItemType.RECORD,
        targetObjectMetadataId: 'metadata-2',
      },
      mockObjectMetadataItems,
      mockViews,
    );
    expect(result).toEqual(mockObjectMetadataItems[1]);
    expect(result?.nameSingular).toBe('company');
  });

  it('should return null for record item when targetObjectMetadataId is undefined', () => {
    const result = getObjectMetadataForNavigationMenuItem(
      { type: NavigationMenuItemType.RECORD },
      mockObjectMetadataItems,
      mockViews,
    );
    expect(result).toBeNull();
  });

  it('should return null for record item when metadata is not found', () => {
    const result = getObjectMetadataForNavigationMenuItem(
      {
        type: NavigationMenuItemType.RECORD,
        targetObjectMetadataId: 'non-existent-metadata',
      },
      mockObjectMetadataItems,
      mockViews,
    );
    expect(result).toBeNull();
  });

  it('should return null for view item when viewId is undefined', () => {
    const result = getObjectMetadataForNavigationMenuItem(
      { type: NavigationMenuItemType.VIEW },
      mockObjectMetadataItems,
      mockViews,
    );
    expect(result).toBeNull();
  });
});
