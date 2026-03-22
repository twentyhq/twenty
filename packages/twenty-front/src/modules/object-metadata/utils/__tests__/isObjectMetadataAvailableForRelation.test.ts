import { isObjectMetadataAvailableForRelation } from '@/object-metadata/utils/isObjectMetadataAvailableForRelation';
import { generateTestEnrichedObjectMetadataItemsMock } from '~/testing/utils/generateTestEnrichedObjectMetadataItemsMock';

describe('isObjectMetadataAvailableForRelation', () => {
  it('should work as expected', () => {
    const objectMetadataItem = generateTestEnrichedObjectMetadataItemsMock.find(
      (item) => item.nameSingular === 'person',
    )!;

    const res = isObjectMetadataAvailableForRelation(objectMetadataItem);
    expect(res).toBe(true);
  });
});
