import { isObjectMetadataAvailableForRelation } from '@/object-metadata/utils/isObjectMetadataAvailableForRelation';
import { getTestEnrichedObjectMetadataItemsMock } from '~/testing/utils/getTestEnrichedObjectMetadataItemsMock';

const getObjectMetadataItemMock = (nameSingular: string) =>
  getTestEnrichedObjectMetadataItemsMock().find(
    (item) => item.nameSingular === nameSingular,
  )!;

describe('isObjectMetadataAvailableForRelation', () => {
  it('should return true when the object is a business object', () => {
    expect(
      isObjectMetadataAvailableForRelation(getObjectMetadataItemMock('person')),
    ).toBe(true);
  });

  it('should return true when the object is a system object', () => {
    expect(
      isObjectMetadataAvailableForRelation(
        getObjectMetadataItemMock('messageThread'),
      ),
    ).toBe(true);
  });

  it('should return false when the object is remote', () => {
    expect(isObjectMetadataAvailableForRelation({ isRemote: true })).toBe(
      false,
    );
  });
});
