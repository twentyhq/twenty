import { isObjectMetadataAvailableForRelation } from '@/object-metadata/utils/isObjectMetadataAvailableForRelation';
import { generatedMockObjectMetadataItems } from '~/testing/utils/generatedMockObjectMetadataItems';

describe('isObjectMetadataAvailableForRelation', () => {
  it('should work as expected', () => {
    const objectMetadataItem = generatedMockObjectMetadataItems.find(
      (item) => item.nameSingular === 'person',
    )!;

    const res = isObjectMetadataAvailableForRelation(objectMetadataItem);
    expect(res).toBe(true);
  });
});
