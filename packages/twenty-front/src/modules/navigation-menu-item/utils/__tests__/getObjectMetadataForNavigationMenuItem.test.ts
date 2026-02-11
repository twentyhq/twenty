import { getObjectMetadataForNavigationMenuItem } from '@/navigation-menu-item/utils/getObjectMetadataForNavigationMenuItem';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { type View } from '@/views/types/View';

const mockObjectMetadataItems: ObjectMetadataItem[] = [
  {
    id: 'metadata-1',
    nameSingular: 'person',
    namePlural: 'people',
  } as ObjectMetadataItem,
  {
    id: 'metadata-2',
    nameSingular: 'company',
    namePlural: 'companies',
  } as ObjectMetadataItem,
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
      { itemType: 'link' },
      mockObjectMetadataItems,
      mockViews,
    );
    expect(result).toBeNull();
  });

  it('should return object metadata for view item when view and metadata exist', () => {
    const result = getObjectMetadataForNavigationMenuItem(
      { itemType: 'view', viewId: 'view-1' },
      mockObjectMetadataItems,
      mockViews,
    );
    expect(result).toEqual(mockObjectMetadataItems[0]);
    expect(result?.nameSingular).toBe('person');
  });

  it('should return null for view item when view is not found', () => {
    const result = getObjectMetadataForNavigationMenuItem(
      { itemType: 'view', viewId: 'non-existent-view' },
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
      { itemType: 'view', viewId: 'orphan-view' },
      mockObjectMetadataItems,
      viewsWithOrphanView,
    );
    expect(result).toBeNull();
  });

  it('should return object metadata for record item when metadata exists', () => {
    const result = getObjectMetadataForNavigationMenuItem(
      {
        itemType: 'record',
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
      { itemType: 'record' },
      mockObjectMetadataItems,
      mockViews,
    );
    expect(result).toBeNull();
  });

  it('should return null for record item when metadata is not found', () => {
    const result = getObjectMetadataForNavigationMenuItem(
      {
        itemType: 'record',
        targetObjectMetadataId: 'non-existent-metadata',
      },
      mockObjectMetadataItems,
      mockViews,
    );
    expect(result).toBeNull();
  });

  it('should return null for view item when viewId is undefined', () => {
    const result = getObjectMetadataForNavigationMenuItem(
      { itemType: 'view' },
      mockObjectMetadataItems,
      mockViews,
    );
    expect(result).toBeNull();
  });
});
