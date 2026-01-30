import { generatedMockObjectMetadataItems } from '~/testing/utils/generatedMockObjectMetadataItems';
import { getNavigationMenuItemSecondaryLabel } from '@/navigation-menu-item/utils/getNavigationMenuItemSecondaryLabel';

describe('getNavigationMenuItemSecondaryLabel', () => {
  it('should return "View" for view object', () => {
    const result = getNavigationMenuItemSecondaryLabel({
      objectMetadataItems: generatedMockObjectMetadataItems,
      navigationMenuItemObjectNameSingular: 'view',
    });

    expect(result).toBe('View');
  });

  it('should return labelSingular for matching object metadata item', () => {
    const result = getNavigationMenuItemSecondaryLabel({
      objectMetadataItems: generatedMockObjectMetadataItems,
      navigationMenuItemObjectNameSingular: 'person',
    });

    expect(result).toBe('Person');
  });

  it('should return undefined when object metadata item is not found', () => {
    const result = getNavigationMenuItemSecondaryLabel({
      objectMetadataItems: generatedMockObjectMetadataItems,
      navigationMenuItemObjectNameSingular: 'nonexistent',
    });

    expect(result).toBeUndefined();
  });
});
