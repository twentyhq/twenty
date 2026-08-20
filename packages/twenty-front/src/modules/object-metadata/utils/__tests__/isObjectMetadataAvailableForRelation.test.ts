import { isObjectMetadataAvailableForRelation } from '@/object-metadata/utils/isObjectMetadataAvailableForRelation';
import { getTestEnrichedObjectMetadataItemsMock } from '~/testing/utils/getTestEnrichedObjectMetadataItemsMock';

describe('isObjectMetadataAvailableForRelation', () => {
  it('should work as expected', () => {
    const objectMetadataItem = getTestEnrichedObjectMetadataItemsMock().find(
      (item) => item.nameSingular === 'person',
    )!;

    const res = isObjectMetadataAvailableForRelation(objectMetadataItem);
    expect(res).toBe(true);
  });
});
