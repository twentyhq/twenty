import { getOrderByFieldForObjectMetadataItem } from '@/object-metadata/utils/getObjectOrderByField';
import { generatedMockObjectMetadataItems } from '~/testing/mock-data/generatedMockObjectMetadataItems';

describe('getObjectOrderByField', () => {
  it('should work as expected', () => {
    const objectMetadataItem = generatedMockObjectMetadataItems.find(
      (item) => item.nameSingular === 'person',
    )!;
    const res = getOrderByFieldForObjectMetadataItem(objectMetadataItem);
    expect(res).toEqual([
      { name: { firstName: 'AscNullsLast', lastName: 'AscNullsLast' } },
    ]);
  });
});
