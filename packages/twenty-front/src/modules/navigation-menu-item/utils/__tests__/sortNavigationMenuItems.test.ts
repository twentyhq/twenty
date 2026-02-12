import { sortNavigationMenuItems } from '@/navigation-menu-item/utils/sortNavigationMenuItems';
import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { type ObjectRecordIdentifier } from '@/object-record/types/ObjectRecordIdentifier';
import { type View } from '@/views/types/View';
import { ViewKey } from '@/views/types/ViewKey';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';

jest.mock('@/favorites/utils/getObjectMetadataNamePluralFromViewId', () => ({
  getObjectMetadataNamePluralFromViewId: jest.fn(
    (
      view: Pick<View, 'id' | 'name' | 'objectMetadataId'>,
      items: ObjectMetadataItem[],
    ) => {
      const item = items.find((item) => item.id === view.objectMetadataId);
      return { namePlural: item?.namePlural ?? 'items' };
    },
  ),
}));

jest.mock('twenty-shared/utils', () => {
  const actual = jest.requireActual('twenty-shared/utils');
  return {
    ...actual,
    getAppPath: jest.fn((path, params, query) => {
      const basePath = `/app/objects/${params.objectNamePlural}`;
      const viewId = query?.viewId;
      if (viewId !== undefined && viewId !== null) {
        return `${basePath}?viewId=${viewId}`;
      }
      return basePath;
    }),
  };
});

describe('sortNavigationMenuItems', () => {
  const mockObjectMetadataItem: ObjectMetadataItem = {
    id: 'metadata-id',
    nameSingular: 'person',
    namePlural: 'people',
    labelPlural: 'People',
    icon: 'IconUser',
  } as ObjectMetadataItem;

  const mockView: Pick<
    View,
    'id' | 'name' | 'objectMetadataId' | 'icon' | 'key'
  > = {
    id: 'view-id',
    name: 'All People',
    objectMetadataId: 'metadata-id',
    icon: 'IconUser',
    key: ViewKey.Index,
  };

  const mockObjectRecordIdentifier: ObjectRecordIdentifier = {
    id: 'record-id',
    name: 'John Doe',
    avatarUrl: 'https://example.com/avatar.jpg',
    avatarType: 'rounded',
    linkToShowPage: '/app/objects/people/record-id',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return empty array when navigationMenuItems is empty', () => {
    const result = sortNavigationMenuItems([], true, [], [], new Map());

    expect(result).toEqual([]);
  });

  it('should process view link navigation menu items', () => {
    const navigationMenuItem: NavigationMenuItem = {
      id: 'item-id',
      viewId: 'view-id',
      position: 1,
    } as NavigationMenuItem;

    const result = sortNavigationMenuItems(
      [navigationMenuItem],
      true,
      [mockView],
      [mockObjectMetadataItem],
      new Map(),
    );

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      id: 'item-id',
      viewId: 'view-id',
      position: 1,
      labelIdentifier: 'People',
      objectNameSingular: 'person',
      Icon: 'IconUser',
    });
    expect(result[0].link).toContain('viewId=view-id');
  });

  it('should return null for view link when view is not found', () => {
    const navigationMenuItem: NavigationMenuItem = {
      id: 'item-id',
      viewId: 'non-existent-view-id',
      position: 1,
    } as NavigationMenuItem;

    const result = sortNavigationMenuItems(
      [navigationMenuItem],
      true,
      [],
      [mockObjectMetadataItem],
      new Map(),
    );

    expect(result).toEqual([]);
  });

  it('should process record link navigation menu items', () => {
    const navigationMenuItem: NavigationMenuItem = {
      id: 'item-id',
      targetRecordId: 'record-id',
      targetObjectMetadataId: 'metadata-id',
      position: 2,
    } as NavigationMenuItem;

    const targetRecordIdentifiers = new Map([
      ['record-id', mockObjectRecordIdentifier],
    ]);

    const result = sortNavigationMenuItems(
      [navigationMenuItem],
      true,
      [],
      [mockObjectMetadataItem],
      targetRecordIdentifiers,
    );

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      id: 'item-id',
      targetRecordId: 'record-id',
      targetObjectMetadataId: 'metadata-id',
      position: 2,
      labelIdentifier: 'John Doe',
      avatarUrl: 'https://example.com/avatar.jpg',
      avatarType: 'rounded',
      link: '/app/objects/people/record-id',
      objectNameSingular: 'person',
    });
  });

  it('should return null for record link when targetRecordId is not defined', () => {
    const navigationMenuItem: NavigationMenuItem = {
      id: 'item-id',
      targetObjectMetadataId: 'metadata-id',
      position: 1,
    } as NavigationMenuItem;

    const result = sortNavigationMenuItems(
      [navigationMenuItem],
      true,
      [],
      [mockObjectMetadataItem],
      new Map(),
    );

    expect(result).toEqual([]);
  });

  it('should return null for record link when objectMetadataItem is not found', () => {
    const navigationMenuItem: NavigationMenuItem = {
      id: 'item-id',
      targetRecordId: 'record-id',
      targetObjectMetadataId: 'non-existent-metadata-id',
      position: 1,
    } as NavigationMenuItem;

    const targetRecordIdentifiers = new Map([
      ['record-id', mockObjectRecordIdentifier],
    ]);

    const result = sortNavigationMenuItems(
      [navigationMenuItem],
      true,
      [],
      [mockObjectMetadataItem],
      targetRecordIdentifiers,
    );

    expect(result).toEqual([]);
  });

  it('should return null for record link when targetRecordIdentifier is not found', () => {
    const navigationMenuItem: NavigationMenuItem = {
      id: 'item-id',
      targetRecordId: 'non-existent-record-id',
      targetObjectMetadataId: 'metadata-id',
      position: 1,
    } as NavigationMenuItem;

    const result = sortNavigationMenuItems(
      [navigationMenuItem],
      true,
      [],
      [mockObjectMetadataItem],
      new Map(),
    );

    expect(result).toEqual([]);
  });

  it('should return empty link when hasLinkToShowPage is false', () => {
    const navigationMenuItem: NavigationMenuItem = {
      id: 'item-id',
      targetRecordId: 'record-id',
      targetObjectMetadataId: 'metadata-id',
      position: 2,
    } as NavigationMenuItem;

    const targetRecordIdentifiers = new Map([
      ['record-id', mockObjectRecordIdentifier],
    ]);

    const result = sortNavigationMenuItems(
      [navigationMenuItem],
      false,
      [],
      [mockObjectMetadataItem],
      targetRecordIdentifiers,
    );

    expect(result).toHaveLength(1);
    expect(result[0].link).toBe('');
  });

  it('should sort navigation menu items by position', () => {
    const navigationMenuItems: NavigationMenuItem[] = [
      {
        id: 'item-3',
        targetRecordId: 'record-id-3',
        targetObjectMetadataId: 'metadata-id',
        position: 3,
      },
      {
        id: 'item-1',
        targetRecordId: 'record-id-1',
        targetObjectMetadataId: 'metadata-id',
        position: 1,
      },
      {
        id: 'item-2',
        targetRecordId: 'record-id-2',
        targetObjectMetadataId: 'metadata-id',
        position: 2,
      },
    ] as NavigationMenuItem[];

    const targetRecordIdentifiers = new Map([
      ['record-id-1', { ...mockObjectRecordIdentifier, id: 'record-id-1' }],
      ['record-id-2', { ...mockObjectRecordIdentifier, id: 'record-id-2' }],
      ['record-id-3', { ...mockObjectRecordIdentifier, id: 'record-id-3' }],
    ]);

    const result = sortNavigationMenuItems(
      navigationMenuItems,
      true,
      [],
      [mockObjectMetadataItem],
      targetRecordIdentifiers,
    );

    expect(result).toHaveLength(3);
    expect(result[0].id).toBe('item-1');
    expect(result[1].id).toBe('item-2');
    expect(result[2].id).toBe('item-3');
  });

  it('should handle mixed view and record link items', () => {
    const navigationMenuItems: NavigationMenuItem[] = [
      {
        id: 'view-item',
        viewId: 'view-id',
        position: 1,
      },
      {
        id: 'record-item',
        targetRecordId: 'record-id',
        targetObjectMetadataId: 'metadata-id',
        position: 2,
      },
    ] as NavigationMenuItem[];

    const targetRecordIdentifiers = new Map([
      ['record-id', mockObjectRecordIdentifier],
    ]);

    const result = sortNavigationMenuItems(
      navigationMenuItems,
      true,
      [mockView],
      [mockObjectMetadataItem],
      targetRecordIdentifiers,
    );

    expect(result).toHaveLength(2);
    expect(result[0].id).toBe('view-item');
    expect(result[0].objectNameSingular).toBe('person');
    expect(result[1].id).toBe('record-item');
    expect(result[1].objectNameSingular).toBe('person');
  });

  it('should handle navigationMenuItem with both viewId and targetRecordId (viewId takes precedence)', () => {
    const navigationMenuItem: NavigationMenuItem = {
      id: 'item-id',
      viewId: 'view-id',
      targetRecordId: 'record-id',
      targetObjectMetadataId: 'metadata-id',
      position: 1,
    } as NavigationMenuItem;

    const result = sortNavigationMenuItems(
      [navigationMenuItem],
      true,
      [mockView],
      [mockObjectMetadataItem],
      new Map(),
    );

    expect(result).toHaveLength(1);
    expect(result[0].objectNameSingular).toBe('person');
    expect(result[0].viewId).toBe('view-id');
  });

  it('should process link items with protocol normalization and label from name or link', () => {
    const withProtocol = sortNavigationMenuItems(
      [
        {
          id: 'link-1',
          link: 'https://example.com',
          name: 'My Link',
          position: 1,
        } as NavigationMenuItem,
      ],
      true,
      [],
      [],
      new Map(),
    );
    expect(withProtocol[0].labelIdentifier).toBe('My Link');
    expect(withProtocol[0].link).toBe('https://example.com');

    const noProtocol = sortNavigationMenuItems(
      [
        {
          id: 'link-2',
          link: 'example.com',
          position: 2,
        } as NavigationMenuItem,
      ],
      true,
      [],
      [],
      new Map(),
    );
    expect(noProtocol[0].link).toBe('https://example.com');
    expect(noProtocol[0].labelIdentifier).toBe('example.com');
  });
});
