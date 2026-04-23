import { getTestEnrichedObjectMetadataItemsMock } from '~/testing/utils/getTestEnrichedObjectMetadataItemsMock';
import { getObjectNavigationMenuItemSecondaryLabel } from '@/navigation-menu-item/display/object/utils/getObjectNavigationMenuItemSecondaryLabel';

describe('getObjectNavigationMenuItemSecondaryLabel', () => {
  it('should return "View" for view object', () => {
    const result = getObjectNavigationMenuItemSecondaryLabel({
      objectMetadataItems: getTestEnrichedObjectMetadataItemsMock(),
      navigationMenuItemObjectNameSingular: 'view',
    });

    expect(result).toBe('View');
  });

  it('should return labelSingular for matching object metadata item', () => {
    const result = getObjectNavigationMenuItemSecondaryLabel({
      objectMetadataItems: getTestEnrichedObjectMetadataItemsMock(),
      navigationMenuItemObjectNameSingular: 'person',
    });

    expect(result).toBe('Person');
  });

  it('should return undefined when object metadata item is not found', () => {
    const result = getObjectNavigationMenuItemSecondaryLabel({
      objectMetadataItems: getTestEnrichedObjectMetadataItemsMock(),
      navigationMenuItemObjectNameSingular: 'nonexistent',
    });

    expect(result).toBeUndefined();
  });
});
