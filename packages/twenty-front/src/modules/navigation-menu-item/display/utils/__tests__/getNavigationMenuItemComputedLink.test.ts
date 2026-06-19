import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type View } from '@/views/types/View';
import {
  NavigationMenuItemType,
  ViewKey,
  type NavigationMenuItem,
} from '~/generated-metadata/graphql';

import { getNavigationMenuItemComputedLink } from '@/navigation-menu-item/display/utils/getNavigationMenuItemComputedLink';

const objectMetadataItems = [
  { id: 'obj-1', namePlural: 'people' },
  { id: 'obj-2', namePlural: 'companies' },
] as EnrichedObjectMetadataItem[];

const views: Pick<View, 'id' | 'objectMetadataId' | 'key'>[] = [
  { id: 'view-index', objectMetadataId: 'obj-1', key: ViewKey.INDEX },
];

const objectItem: NavigationMenuItem = {
  id: 'nav-1',
  type: NavigationMenuItemType.OBJECT,
  targetObjectMetadataId: 'obj-1',
  position: 0,
  createdAt: '',
  updatedAt: '',
};

describe('getNavigationMenuItemComputedLink', () => {
  it('should link an object item to its last visited view when one is recorded', () => {
    const link = getNavigationMenuItemComputedLink({
      item: objectItem,
      objectMetadataItems,
      views,
      lastVisitedViewPerObjectMetadataItem: { 'obj-1': 'view-custom' },
    });

    expect(link).toBe('/objects/people?viewId=view-custom');
  });

  // Regression: the link used to always force ?viewId=<index view>, which
  // overrode the last-visited-view restoration in MainContextStoreProvider.
  // With no recorded last visited view the link must stay bare so the context
  // store resolves the view instead of this util forcing the index one.
  it('should link an object item to the bare path when no last visited view is recorded', () => {
    const link = getNavigationMenuItemComputedLink({
      item: objectItem,
      objectMetadataItems,
      views,
      lastVisitedViewPerObjectMetadataItem: null,
    });

    expect(link).toBe('/objects/people');
  });

  it('should not use another object last visited view', () => {
    const link = getNavigationMenuItemComputedLink({
      item: objectItem,
      objectMetadataItems,
      views,
      lastVisitedViewPerObjectMetadataItem: { 'obj-2': 'view-other' },
    });

    expect(link).toBe('/objects/people');
  });
});
