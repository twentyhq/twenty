import { isObjectMetadataEligibleAsRelationTarget } from '@/object-metadata/utils/isObjectMetadataEligibleAsRelationTarget';
import { getTestEnrichedObjectMetadataItemsMock } from '~/testing/utils/getTestEnrichedObjectMetadataItemsMock';

const getObjectMetadataItemMock = (nameSingular: string) =>
  getTestEnrichedObjectMetadataItemsMock().find(
    (item) => item.nameSingular === nameSingular,
  )!;

describe('isObjectMetadataEligibleAsRelationTarget', () => {
  it('should return true when the object is a business object', () => {
    expect(
      isObjectMetadataEligibleAsRelationTarget(
        getObjectMetadataItemMock('person'),
      ),
    ).toBe(true);
  });

  it('should return true when the object is a system object', () => {
    expect(
      isObjectMetadataEligibleAsRelationTarget(
        getObjectMetadataItemMock('messageThread'),
      ),
    ).toBe(true);
  });

  it('should return false when the object is remote', () => {
    expect(isObjectMetadataEligibleAsRelationTarget({ isRemote: true })).toBe(
      false,
    );
  });
});
