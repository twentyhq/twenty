import { getObjectDrawerItemNavigationPath } from '@/navigation-menu-item/display/object/utils/getObjectDrawerItemNavigationPath';
import { NavigationMenuItemType } from 'twenty-shared/types';
import {
  type NavigationMenuItem,
  ViewKey,
  ViewType,
} from '~/generated-metadata/graphql';

const OBJECT_METADATA_ID = 'object-metadata-id';

const objectMetadataItem = {
  id: OBJECT_METADATA_ID,
  namePlural: 'companies',
};

const objectMetadataItems = [objectMetadataItem] as unknown as Parameters<
  typeof getObjectDrawerItemNavigationPath
>[0]['objectMetadataItems'];

const makeView = (id: string, key: ViewKey | null, position: number) => ({
  id,
  objectMetadataId: OBJECT_METADATA_ID,
  key,
  type: ViewType.TABLE,
  position,
});

const indexView = makeView('index-view-id', ViewKey.INDEX, 0);
const initialView = makeView('initial-view-id', null, 1);

const objectNavigationMenuItem = {
  id: 'navigation-menu-item-id',
  type: NavigationMenuItemType.OBJECT,
  targetObjectMetadataId: OBJECT_METADATA_ID,
} as NavigationMenuItem;

describe('getObjectDrawerItemNavigationPath', () => {
  it('should target the index view without a navigation menu item when the flag is off', () => {
    expect(
      getObjectDrawerItemNavigationPath({
        objectMetadataItem,
        objectMetadataItems,
        views: [indexView, initialView],
        lastVisitedViewPerObjectMetadataItem: null,
        isInitialObjectViewEnabled: false,
      }),
    ).toBe('/objects/companies?viewId=index-view-id');
  });

  it('should target the initial view without a navigation menu item when the flag is on', () => {
    expect(
      getObjectDrawerItemNavigationPath({
        objectMetadataItem,
        objectMetadataItems,
        views: [indexView, initialView],
        lastVisitedViewPerObjectMetadataItem: null,
        isInitialObjectViewEnabled: true,
      }),
    ).toBe('/objects/companies?viewId=initial-view-id');
  });

  it('should ignore a stale index last visited view when the flag is on', () => {
    expect(
      getObjectDrawerItemNavigationPath({
        objectMetadataItem,
        objectMetadataItems,
        views: [indexView, initialView],
        lastVisitedViewPerObjectMetadataItem: {
          [OBJECT_METADATA_ID]: 'index-view-id',
        },
        isInitialObjectViewEnabled: true,
      }),
    ).toBe('/objects/companies?viewId=initial-view-id');
  });

  it('should honor a last visited view that is not the index view', () => {
    expect(
      getObjectDrawerItemNavigationPath({
        objectMetadataItem,
        objectMetadataItems,
        views: [indexView, initialView, makeView('user-view-id', null, 7)],
        lastVisitedViewPerObjectMetadataItem: {
          [OBJECT_METADATA_ID]: 'user-view-id',
        },
        isInitialObjectViewEnabled: true,
      }),
    ).toBe('/objects/companies?viewId=user-view-id');
  });

  it('should delegate to the navigation menu item link when there is one', () => {
    expect(
      getObjectDrawerItemNavigationPath({
        navigationMenuItem: objectNavigationMenuItem,
        objectMetadataItem,
        objectMetadataItems,
        views: [indexView, initialView],
        lastVisitedViewPerObjectMetadataItem: null,
        isInitialObjectViewEnabled: true,
      }),
    ).toBe('/objects/companies?viewId=initial-view-id');
  });
});
