import { getObjectMetadataItemByNameSingular } from '@/object-metadata/utils/getObjectMetadataItemBySingularName';
import { generatedMockObjectMetadataItems } from '~/testing/mock-data/generatedMockObjectMetadataItems';

describe('getObjectMetadataItemBySingularName', () => {
  it('should work as expected', () => {
    const firstObjectMetadataItem = generatedMockObjectMetadataItems[0];

    const foundObjectMetadataItem = getObjectMetadataItemByNameSingular({
      objectMetadataItems: generatedMockObjectMetadataItems,
      objectNameSingular: firstObjectMetadataItem.nameSingular,
    });

    expect(foundObjectMetadataItem.id).toEqual(firstObjectMetadataItem.id);
  });
});
