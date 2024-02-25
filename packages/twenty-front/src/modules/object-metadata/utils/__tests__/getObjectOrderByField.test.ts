import { getObjectMetadataItemsMock } from '@/object-metadata/utils/getObjectMetadataItemsMock';
import { getObjectOrderByField } from '@/object-metadata/utils/getObjectOrderByField';

const mockObjectMetadataItems = getObjectMetadataItemsMock();

describe('getObjectOrderByField', () => {
  it('should work as expected', () => {
    const objectMetadataItem = mockObjectMetadataItems.find(
      (item) => item.nameSingular === 'person',
    )!;
    const res = getObjectOrderByField(objectMetadataItem);
    expect(res).toEqual({
      name: { firstName: 'AscNullsLast', lastName: 'AscNullsLast' },
    });
  });
});
