import { NavigationMenuItemType } from 'twenty-shared/types';

import { filterAndSortNavigationMenuItems } from '@/navigation-menu-item/common/utils/filterAndSortNavigationMenuItems';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type View } from '@/views/types/View';
import { ViewKey } from '@/views/types/ViewKey';
import { type NavigationMenuItem } from '~/generated-metadata/graphql';

describe('filterAndSortNavigationMenuItems', () => {
  const mockObjectMetadataItem: EnrichedObjectMetadataItem = {
    id: 'metadata-id',
    nameSingular: 'person',
    namePlural: 'people',
    labelPlural: 'People',
    icon: 'IconUser',
    isActive: true,
  } as EnrichedObjectMetadataItem;

  const mockView: Pick<View, 'id' | 'objectMetadataId' | 'key'> = {
    id: 'view-id',
    objectMetadataId: 'metadata-id',
    key: ViewKey.INDEX,
  };

  const mockWorkflowObjectMetadataItem = {
    id: 'workflow-metadata-id',
    nameSingular: 'workflow',
    namePlural: 'workflows',
    labelPlural: 'Workflows',
    icon: 'IconSettingsAutomation',
    isActive: true,
  } as EnrichedObjectMetadataItem;

  const workflowRecordItem = {
    id: 'workflow-favorite-id',
    type: NavigationMenuItemType.RECORD,
    position: 0,
    targetRecordId: 'workflow-record-id',
    targetObjectMetadataId: 'workflow-metadata-id',
    targetRecordIdentifier: { id: 'workflow-record-id', name: 'My workflow' },
  } as unknown as NavigationMenuItem;

  it('hides workflow record items when the workflow core index page is enabled', () => {
    expect(
      filterAndSortNavigationMenuItems(
        [workflowRecordItem],
        [],
        [mockWorkflowObjectMetadataItem],
        true,
      ),
    ).toEqual([]);
  });

  it('keeps workflow record items when the workflow core index page is disabled', () => {
    expect(
      filterAndSortNavigationMenuItems(
        [workflowRecordItem],
        [],
        [mockWorkflowObjectMetadataItem],
        false,
      ),
    ).toEqual([workflowRecordItem]);
  });

  it('keeps other objects record items when the workflow core index page is enabled', () => {
    const personRecordItem = {
      id: 'person-favorite-id',
      type: NavigationMenuItemType.RECORD,
      position: 0,
      targetRecordId: 'person-record-id',
      targetObjectMetadataId: 'metadata-id',
      targetRecordIdentifier: { id: 'person-record-id', name: 'Jane' },
    } as unknown as NavigationMenuItem;

    expect(
      filterAndSortNavigationMenuItems(
        [personRecordItem],
        [],
        [mockObjectMetadataItem],
        true,
      ),
    ).toEqual([personRecordItem]);
  });

  it('should return empty array when navigationMenuItems is empty', () => {
    const result = filterAndSortNavigationMenuItems([], [], [], false);
    expect(result).toEqual([]);
  });

  it('should keep view items when view and objectMetadata exist', () => {
    const navigationMenuItem = {
      id: 'item-id',
      type: NavigationMenuItemType.VIEW,
      viewId: 'view-id',
      position: 1,
    } as NavigationMenuItem;

    const result = filterAndSortNavigationMenuItems(
      [navigationMenuItem],
      [mockView],
      [mockObjectMetadataItem],
      false,
    );

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('item-id');
  });

  it('should filter out view items when view is not found', () => {
    const navigationMenuItem = {
      id: 'item-id',
      type: NavigationMenuItemType.VIEW,
      viewId: 'non-existent-view-id',
      position: 1,
    } as NavigationMenuItem;

    const result = filterAndSortNavigationMenuItems(
      [navigationMenuItem],
      [],
      [mockObjectMetadataItem],
      false,
    );

    expect(result).toEqual([]);
  });

  it('should keep record items when targetRecordIdentifier exists', () => {
    const navigationMenuItem = {
      id: 'item-id',
      type: NavigationMenuItemType.RECORD,
      targetRecordId: 'record-id',
      targetObjectMetadataId: 'metadata-id',
      targetRecordIdentifier: {
        id: 'record-id',
        labelIdentifier: 'John Doe',
      },
      position: 2,
    } as NavigationMenuItem;

    const result = filterAndSortNavigationMenuItems(
      [navigationMenuItem],
      [],
      [mockObjectMetadataItem],
      false,
    );

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('item-id');
  });

  it('should filter out record items when targetRecordId is not defined', () => {
    const navigationMenuItem = {
      id: 'item-id',
      type: NavigationMenuItemType.RECORD,
      targetObjectMetadataId: 'metadata-id',
      position: 1,
    } as NavigationMenuItem;

    const result = filterAndSortNavigationMenuItems(
      [navigationMenuItem],
      [],
      [mockObjectMetadataItem],
      false,
    );

    expect(result).toEqual([]);
  });

  it('should filter out record items when objectMetadataItem is not found', () => {
    const navigationMenuItem = {
      id: 'item-id',
      type: NavigationMenuItemType.RECORD,
      targetRecordId: 'record-id',
      targetObjectMetadataId: 'non-existent-metadata-id',
      targetRecordIdentifier: {
        id: 'record-id',
        labelIdentifier: 'John',
      },
      position: 1,
    } as NavigationMenuItem;

    const result = filterAndSortNavigationMenuItems(
      [navigationMenuItem],
      [],
      [mockObjectMetadataItem],
      false,
    );

    expect(result).toEqual([]);
  });

  it('should sort navigation menu items by position', () => {
    const navigationMenuItems = [
      {
        id: 'item-3',
        type: NavigationMenuItemType.RECORD,
        targetRecordId: 'record-id-3',
        targetObjectMetadataId: 'metadata-id',
        targetRecordIdentifier: {
          id: 'record-id-3',
          labelIdentifier: 'C',
        },
        position: 3,
      },
      {
        id: 'item-1',
        type: NavigationMenuItemType.RECORD,
        targetRecordId: 'record-id-1',
        targetObjectMetadataId: 'metadata-id',
        targetRecordIdentifier: {
          id: 'record-id-1',
          labelIdentifier: 'A',
        },
        position: 1,
      },
      {
        id: 'item-2',
        type: NavigationMenuItemType.RECORD,
        targetRecordId: 'record-id-2',
        targetObjectMetadataId: 'metadata-id',
        targetRecordIdentifier: {
          id: 'record-id-2',
          labelIdentifier: 'B',
        },
        position: 2,
      },
    ] as NavigationMenuItem[];

    const result = filterAndSortNavigationMenuItems(
      navigationMenuItems,
      [],
      [mockObjectMetadataItem],
      false,
    );

    expect(result).toHaveLength(3);
    expect(result[0].id).toBe('item-1');
    expect(result[1].id).toBe('item-2');
    expect(result[2].id).toBe('item-3');
  });

  it('should keep link items', () => {
    const result = filterAndSortNavigationMenuItems(
      [
        {
          id: 'link-1',
          type: NavigationMenuItemType.LINK,
          link: 'https://example.com',
          name: 'My Link',
          position: 1,
        } as NavigationMenuItem,
      ],
      [],
      [],
      false,
    );
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('link-1');
  });

  it('should keep object items when objectMetadata exists', () => {
    const result = filterAndSortNavigationMenuItems(
      [
        {
          id: 'obj-1',
          type: NavigationMenuItemType.OBJECT,
          targetObjectMetadataId: 'metadata-id',
          position: 1,
        } as NavigationMenuItem,
      ],
      [],
      [mockObjectMetadataItem],
      false,
    );
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('obj-1');
  });

  it('should filter out object items when objectMetadata is not found', () => {
    const result = filterAndSortNavigationMenuItems(
      [
        {
          id: 'obj-1',
          type: NavigationMenuItemType.OBJECT,
          targetObjectMetadataId: 'non-existent-id',
          position: 1,
        } as NavigationMenuItem,
      ],
      [],
      [mockObjectMetadataItem],
      false,
    );
    expect(result).toEqual([]);
  });

  it('should filter out items for deactivated objects', () => {
    const inactiveObjectMetadataItem = {
      ...mockObjectMetadataItem,
      id: 'inactive-metadata-id',
      isActive: false,
    } as EnrichedObjectMetadataItem;

    const result = filterAndSortNavigationMenuItems(
      [
        {
          id: 'obj-1',
          type: NavigationMenuItemType.OBJECT,
          targetObjectMetadataId: 'inactive-metadata-id',
          position: 1,
        } as NavigationMenuItem,
      ],
      [],
      [inactiveObjectMetadataItem],
      false,
    );
    expect(result).toEqual([]);
  });

  it('should filter out view items for deactivated objects', () => {
    const inactiveObjectMetadataItem = {
      ...mockObjectMetadataItem,
      id: 'inactive-metadata-id',
      isActive: false,
    } as EnrichedObjectMetadataItem;

    const viewForInactiveObject: Pick<View, 'id' | 'objectMetadataId' | 'key'> =
      {
        id: 'view-for-inactive',
        objectMetadataId: 'inactive-metadata-id',
        key: ViewKey.INDEX,
      };

    const result = filterAndSortNavigationMenuItems(
      [
        {
          id: 'view-item-1',
          type: NavigationMenuItemType.VIEW,
          viewId: 'view-for-inactive',
          position: 1,
        } as NavigationMenuItem,
      ],
      [viewForInactiveObject],
      [inactiveObjectMetadataItem],
      false,
    );
    expect(result).toEqual([]);
  });

  it('should keep folder items', () => {
    const result = filterAndSortNavigationMenuItems(
      [
        {
          id: 'folder-1',
          type: NavigationMenuItemType.FOLDER,
          name: 'My Folder',
          position: 1,
        } as NavigationMenuItem,
      ],
      [],
      [],
      false,
    );
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('folder-1');
  });
});
