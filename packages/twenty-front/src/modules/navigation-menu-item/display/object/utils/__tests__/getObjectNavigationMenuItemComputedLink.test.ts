import { getObjectNavigationMenuItemComputedLink } from '@/navigation-menu-item/display/object/utils/getObjectNavigationMenuItemComputedLink';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type View } from '@/views/types/View';
import { ViewKey, ViewType } from '~/generated-metadata/graphql';

const mockObjectMetadataItems: Pick<
  EnrichedObjectMetadataItem,
  'id' | 'namePlural'
>[] = [
  {
    id: 'metadata-1',
    namePlural: 'people',
  },
];

const mockViews: Pick<
  View,
  'id' | 'objectMetadataId' | 'key' | 'type' | 'position'
>[] = [
  {
    id: 'view-index',
    objectMetadataId: 'metadata-1',
    key: ViewKey.INDEX,
    type: ViewType.TABLE,
    position: 0,
  },
];

const mockViewsWithSeededView: Pick<
  View,
  'id' | 'objectMetadataId' | 'key' | 'type' | 'position'
>[] = [
  ...mockViews,
  {
    id: 'view-seeded',
    objectMetadataId: 'metadata-1',
    key: null,
    type: ViewType.TABLE,
    position: 1,
  },
];

describe('getObjectNavigationMenuItemComputedLink', () => {
  it('should link to the index view when no last visited view is provided', () => {
    const result = getObjectNavigationMenuItemComputedLink({
      item: { targetObjectMetadataId: 'metadata-1' },
      objectMetadataItems: mockObjectMetadataItems,
      views: mockViews,
    });

    expect(result).toBe('/objects/people?viewId=view-index');
  });

  it('should link to the last visited view when provided, overriding the index view', () => {
    const result = getObjectNavigationMenuItemComputedLink({
      item: { targetObjectMetadataId: 'metadata-1' },
      objectMetadataItems: mockObjectMetadataItems,
      views: mockViews,
      lastVisitedViewId: 'view-42',
    });

    expect(result).toBe('/objects/people?viewId=view-42');
  });

  it('should link to the bare object path when neither a last visited nor an index view exists', () => {
    const result = getObjectNavigationMenuItemComputedLink({
      item: { targetObjectMetadataId: 'metadata-1' },
      objectMetadataItems: mockObjectMetadataItems,
      views: [],
    });

    expect(result).toBe('/objects/people');
  });

  it('should return an empty string when the target object metadata is not found', () => {
    const result = getObjectNavigationMenuItemComputedLink({
      item: { targetObjectMetadataId: 'non-existent-metadata' },
      objectMetadataItems: mockObjectMetadataItems,
      views: mockViews,
      lastVisitedViewId: 'view-42',
    });

    expect(result).toBe('');
  });

  it('should keep linking to the index view when the seeded default view flag is off', () => {
    const result = getObjectNavigationMenuItemComputedLink({
      item: { targetObjectMetadataId: 'metadata-1' },
      objectMetadataItems: mockObjectMetadataItems,
      views: mockViewsWithSeededView,
      isSeededDefaultViewEnabled: false,
    });

    expect(result).toBe('/objects/people?viewId=view-index');
  });

  it('should link to the seeded view instead of the index view when the flag is on', () => {
    const result = getObjectNavigationMenuItemComputedLink({
      item: { targetObjectMetadataId: 'metadata-1' },
      objectMetadataItems: mockObjectMetadataItems,
      views: mockViewsWithSeededView,
      isSeededDefaultViewEnabled: true,
    });

    expect(result).toBe('/objects/people?viewId=view-seeded');
  });

  it('should fall back to the index view when the flag is on and no seeded view exists', () => {
    const result = getObjectNavigationMenuItemComputedLink({
      item: { targetObjectMetadataId: 'metadata-1' },
      objectMetadataItems: mockObjectMetadataItems,
      views: mockViews,
      isSeededDefaultViewEnabled: true,
    });

    expect(result).toBe('/objects/people?viewId=view-index');
  });

  it('should never target a fields widget view when the flag is on', () => {
    const result = getObjectNavigationMenuItemComputedLink({
      item: { targetObjectMetadataId: 'metadata-1' },
      objectMetadataItems: mockObjectMetadataItems,
      views: [
        ...mockViews,
        {
          id: 'view-widget',
          objectMetadataId: 'metadata-1',
          key: null,
          type: ViewType.FIELDS_WIDGET,
          position: 2,
        },
      ],
      isSeededDefaultViewEnabled: true,
    });

    expect(result).toBe('/objects/people?viewId=view-index');
  });

  it('should ignore a last visited view pointing at the index view when the flag is on', () => {
    const result = getObjectNavigationMenuItemComputedLink({
      item: { targetObjectMetadataId: 'metadata-1' },
      objectMetadataItems: mockObjectMetadataItems,
      views: mockViewsWithSeededView,
      lastVisitedViewId: 'view-index',
      isSeededDefaultViewEnabled: true,
    });

    expect(result).toBe('/objects/people?viewId=view-seeded');
  });

  it('should still honour a last visited view that is not the index view when the flag is on', () => {
    const result = getObjectNavigationMenuItemComputedLink({
      item: { targetObjectMetadataId: 'metadata-1' },
      objectMetadataItems: mockObjectMetadataItems,
      views: mockViewsWithSeededView,
      lastVisitedViewId: 'view-42',
      isSeededDefaultViewEnabled: true,
    });

    expect(result).toBe('/objects/people?viewId=view-42');
  });

  it('should still honour a last visited index view when the flag is off', () => {
    const result = getObjectNavigationMenuItemComputedLink({
      item: { targetObjectMetadataId: 'metadata-1' },
      objectMetadataItems: mockObjectMetadataItems,
      views: mockViewsWithSeededView,
      lastVisitedViewId: 'view-index',
      isSeededDefaultViewEnabled: false,
    });

    expect(result).toBe('/objects/people?viewId=view-index');
  });

  it('should target the lowest-positioned non-index view regardless of array order', () => {
    const result = getObjectNavigationMenuItemComputedLink({
      item: { targetObjectMetadataId: 'metadata-1' },
      objectMetadataItems: mockObjectMetadataItems,
      views: [
        {
          id: 'view-user-created',
          objectMetadataId: 'metadata-1',
          key: null,
          type: ViewType.TABLE,
          position: 7,
        },
        ...mockViewsWithSeededView,
      ],
      isSeededDefaultViewEnabled: true,
    });

    expect(result).toBe('/objects/people?viewId=view-seeded');
  });
});
