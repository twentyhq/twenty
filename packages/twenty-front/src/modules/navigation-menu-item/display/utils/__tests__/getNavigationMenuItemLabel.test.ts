import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type View } from '@/views/types/View';
import {
  NavigationMenuItemType,
  ViewKey,
  type NavigationMenuItem,
} from '~/generated-metadata/graphql';

import { getNavigationMenuItemLabel } from '@/navigation-menu-item/display/utils/getNavigationMenuItemLabel';

type ObjectMetadata = Pick<
  EnrichedObjectMetadataItem,
  'id' | 'labelPlural' | 'nameSingular'
>;
type ViewMetadata = Pick<View, 'id' | 'name' | 'objectMetadataId' | 'key'>;

const objectMetadataItems: ObjectMetadata[] = [
  { id: 'obj-1', labelPlural: 'Notes', nameSingular: 'note' },
  { id: 'obj-2', labelPlural: 'Companies', nameSingular: 'company' },
];

const views: ViewMetadata[] = [
  {
    id: 'view-index',
    name: 'All Notes',
    objectMetadataId: 'obj-1',
    key: ViewKey.INDEX,
  },
  {
    id: 'view-custom',
    name: 'My Custom View',
    objectMetadataId: 'obj-1',
    key: null,
  },
];

const baseItem: NavigationMenuItem = {
  id: 'nav-1',
  type: NavigationMenuItemType.OBJECT,
  position: 0,
  createdAt: '',
  updatedAt: '',
};

describe('getNavigationMenuItemLabel', () => {
  describe('when type is OBJECT', () => {
    it('should return labelPlural for a matching object', () => {
      const item = {
        ...baseItem,
        type: NavigationMenuItemType.OBJECT,
        targetObjectMetadataId: 'obj-1',
      };

      expect(getNavigationMenuItemLabel(item, objectMetadataItems, views)).toBe(
        'Notes',
      );
    });

    it('should return empty string when object is not found', () => {
      const item = {
        ...baseItem,
        type: NavigationMenuItemType.OBJECT,
        targetObjectMetadataId: 'nonexistent',
      };

      expect(getNavigationMenuItemLabel(item, objectMetadataItems, views)).toBe(
        '',
      );
    });
  });

  describe('when type is VIEW', () => {
    it('should return the resolved view name for an INDEX view', () => {
      const item = {
        ...baseItem,
        type: NavigationMenuItemType.VIEW,
        viewId: 'view-index',
      };

      expect(getNavigationMenuItemLabel(item, objectMetadataItems, views)).toBe(
        'All Notes',
      );
    });

    it('should return the view name for a non-INDEX view', () => {
      const item = {
        ...baseItem,
        type: NavigationMenuItemType.VIEW,
        viewId: 'view-custom',
      };

      expect(getNavigationMenuItemLabel(item, objectMetadataItems, views)).toBe(
        'My Custom View',
      );
    });

    it('should return empty string when view is not found', () => {
      const item = {
        ...baseItem,
        type: NavigationMenuItemType.VIEW,
        viewId: 'nonexistent',
      };

      expect(getNavigationMenuItemLabel(item, objectMetadataItems, views)).toBe(
        '',
      );
    });
  });

  describe('when type is LINK', () => {
    it('should return the item name when present', () => {
      const item = {
        ...baseItem,
        type: NavigationMenuItemType.LINK,
        name: 'Documentation',
        link: 'https://docs.example.com',
      };

      expect(getNavigationMenuItemLabel(item, objectMetadataItems, views)).toBe(
        'Documentation',
      );
    });

    it('should return the link URL when name is null', () => {
      const item = {
        ...baseItem,
        type: NavigationMenuItemType.LINK,
        name: null,
        link: 'https://docs.example.com',
      };

      expect(getNavigationMenuItemLabel(item, objectMetadataItems, views)).toBe(
        'https://docs.example.com',
      );
    });

    it('should return "Link" when both name and link are empty', () => {
      const item = {
        ...baseItem,
        type: NavigationMenuItemType.LINK,
        name: null,
        link: '  ',
      };

      expect(getNavigationMenuItemLabel(item, objectMetadataItems, views)).toBe(
        'Link',
      );
    });
  });

  describe('when type is RECORD', () => {
    it('should return labelIdentifier from targetRecordIdentifier', () => {
      const item = {
        ...baseItem,
        type: NavigationMenuItemType.RECORD,
        targetRecordIdentifier: {
          id: 'rec-1',
          labelIdentifier: 'Acme Corp',
        },
      };

      expect(getNavigationMenuItemLabel(item, objectMetadataItems, views)).toBe(
        'Acme Corp',
      );
    });

    it('should return empty string when targetRecordIdentifier is missing', () => {
      const item = {
        ...baseItem,
        type: NavigationMenuItemType.RECORD,
        targetRecordIdentifier: null,
      };

      expect(getNavigationMenuItemLabel(item, objectMetadataItems, views)).toBe(
        '',
      );
    });
  });

  describe('when type is FOLDER', () => {
    it('should return the item name when present', () => {
      const item = {
        ...baseItem,
        type: NavigationMenuItemType.FOLDER,
        name: 'Sales',
      };

      expect(getNavigationMenuItemLabel(item, objectMetadataItems, views)).toBe(
        'Sales',
      );
    });

    it('should return "Folder" when name is null', () => {
      const item = {
        ...baseItem,
        type: NavigationMenuItemType.FOLDER,
        name: null,
      };

      expect(getNavigationMenuItemLabel(item, objectMetadataItems, views)).toBe(
        'Folder',
      );
    });
  });
});
