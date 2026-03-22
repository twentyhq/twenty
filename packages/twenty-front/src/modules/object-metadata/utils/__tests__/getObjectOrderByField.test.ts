import { getOrderByFieldForObjectMetadataItem } from '@/object-metadata/utils/getObjectOrderByField';
import { generateTestEnrichedObjectMetadataItemsMock } from '~/testing/utils/generateTestEnrichedObjectMetadataItemsMock';

describe('getObjectOrderByField', () => {
  it('should work as expected', () => {
    const objectMetadataItem = generateTestEnrichedObjectMetadataItemsMock.find(
      (item) => item.nameSingular === 'person',
    )!;
    const res = getOrderByFieldForObjectMetadataItem(objectMetadataItem);
    expect(res).toEqual([
      { name: { firstName: 'AscNullsLast', lastName: 'AscNullsLast' } },
    ]);
  });
});
