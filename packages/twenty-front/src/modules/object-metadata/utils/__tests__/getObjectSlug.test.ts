import { getObjectSlug } from '@/object-metadata/utils/getObjectSlug';
import { generatedMockObjectMetadataItems } from '~/testing/mock-data/generatedMockObjectMetadataItems';

describe('getObjectSlug', () => {
  it('should work as expected', () => {
    const objectMetadataItem = generatedMockObjectMetadataItems.find(
      (item) => item.nameSingular === 'person',
    )!;

    const res = getObjectSlug(objectMetadataItem);
    expect(res).toBe('people');
  });
});
