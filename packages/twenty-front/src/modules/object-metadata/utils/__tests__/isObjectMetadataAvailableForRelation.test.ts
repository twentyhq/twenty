import { getObjectMetadataItemsMock } from '@/object-metadata/utils/getObjectMetadataItemsMock';
import { isObjectMetadataAvailableForRelation } from '@/object-metadata/utils/isObjectMetadataAvailableForRelation';

const mockObjectMetadataItems = getObjectMetadataItemsMock();

describe('isObjectMetadataAvailableForRelation', () => {
  it('should work as expected', () => {
    const objectMetadataItem = mockObjectMetadataItems.find(
      (item) => item.nameSingular === 'person',
    )!;

    const res = isObjectMetadataAvailableForRelation(objectMetadataItem);
    expect(res).toBe(true);
  });
});
