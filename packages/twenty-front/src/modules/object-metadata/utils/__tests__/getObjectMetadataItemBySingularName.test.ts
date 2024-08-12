import { getObjectMetadataItemByNameSingular } from '@/object-metadata/utils/getObjectMetadataItemBySingularName';
import { getObjectMetadataItemsMock } from '@/object-metadata/utils/getObjectMetadataItemsMock';

const mockObjectMetadataItems = getObjectMetadataItemsMock();

describe('getObjectMetadataItemBySingularName', () => {
  it('should work as expected', () => {
    const firstObjectMetadataItem = mockObjectMetadataItems[0];

    const foundObjectMetadataItem = getObjectMetadataItemByNameSingular({
      objectMetadataItems: mockObjectMetadataItems,
      objectNameSingular: firstObjectMetadataItem.nameSingular,
    });

    expect(foundObjectMetadataItem.id).toEqual(firstObjectMetadataItem.id);
  });
});
