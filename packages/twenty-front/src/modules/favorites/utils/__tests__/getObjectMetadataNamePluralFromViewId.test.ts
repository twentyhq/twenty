import { getObjectMetadataNamePluralFromViewId } from '@/favorites/utils/getObjectMetadataNamePluralFromViewId';
import { type View } from '@/views/types/View';
import { generatedMockObjectMetadataItems } from '~/testing/utils/generatedMockObjectMetadataItems';

describe('getObjectMetadataNamePluralFromViewId', () => {
  it('should return namePlural and view for matching objectMetadataId', () => {
    const view: Pick<View, 'id' | 'name' | 'objectMetadataId'> = {
      id: 'view-id',
      name: 'All People',
      objectMetadataId:
        generatedMockObjectMetadataItems[0]?.id ?? 'metadata-id',
    };

    const result = getObjectMetadataNamePluralFromViewId(
      view,
      generatedMockObjectMetadataItems,
    );

    expect(result.namePlural).toBeDefined();
    expect(result.view).toEqual(view);
  });

  it('should throw error when objectMetadataItem is not found', () => {
    const view: Pick<View, 'id' | 'name' | 'objectMetadataId'> = {
      id: 'view-id',
      name: 'All People',
      objectMetadataId: 'non-existent-id',
    };

    expect(() => {
      getObjectMetadataNamePluralFromViewId(
        view,
        generatedMockObjectMetadataItems,
      );
    }).toThrow('Object metadata item not found for id non-existent-id');
  });
});
