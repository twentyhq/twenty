import { getObjectMetadataItemsMock } from '@/object-metadata/utils/getObjectMetadataItemsMock';
import { getObjectSlug } from '@/object-metadata/utils/getObjectSlug';

const mockObjectMetadataItems = getObjectMetadataItemsMock();

describe('getObjectSlug', () => {
  it('should work as expected', () => {
    const objectMetadataItem = mockObjectMetadataItems.find(
      (item) => item.nameSingular === 'person',
    )!;

    const res = getObjectSlug(objectMetadataItem);
    expect(res).toBe('people');
  });
});
