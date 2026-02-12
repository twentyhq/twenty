import { generatedMockObjectMetadataItems } from '~/testing/utils/generatedMockObjectMetadataItems';
import { getFavoriteSecondaryLabel } from '@/favorites/utils/getFavoriteSecondaryLabel';

describe('getFavoriteSecondaryLabel', () => {
  it('should return "View" for view object', () => {
    const result = getFavoriteSecondaryLabel({
      objectMetadataItems: generatedMockObjectMetadataItems,
      favoriteObjectNameSingular: 'view',
    });

    expect(result).toBe('View');
  });

  it('should return labelSingular for matching object metadata item', () => {
    const result = getFavoriteSecondaryLabel({
      objectMetadataItems: generatedMockObjectMetadataItems,
      favoriteObjectNameSingular: 'person',
    });

    expect(result).toBe('Person');
  });

  it('should return undefined when object metadata item is not found', () => {
    const result = getFavoriteSecondaryLabel({
      objectMetadataItems: generatedMockObjectMetadataItems,
      favoriteObjectNameSingular: 'nonexistent',
    });

    expect(result).toBeUndefined();
  });
});
