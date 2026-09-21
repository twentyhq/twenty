import { isAdvancedRelationTargetObjectMetadata } from '@/object-metadata/utils/isAdvancedRelationTargetObjectMetadata';
import { getTestEnrichedObjectMetadataItemsMock } from '~/testing/utils/getTestEnrichedObjectMetadataItemsMock';

const getObjectMetadataItemMock = (nameSingular: string) =>
  getTestEnrichedObjectMetadataItemsMock().find(
    (item) => item.nameSingular === nameSingular,
  )!;

describe('isAdvancedRelationTargetObjectMetadata', () => {
  it('should return true when the object is a system object', () => {
    expect(
      isAdvancedRelationTargetObjectMetadata(
        getObjectMetadataItemMock('messageThread'),
      ),
    ).toBe(true);
  });

  it('should return false when the object is a business object', () => {
    expect(
      isAdvancedRelationTargetObjectMetadata(
        getObjectMetadataItemMock('company'),
      ),
    ).toBe(false);
  });

  it('should return false when the object is workspaceMember', () => {
    expect(
      isAdvancedRelationTargetObjectMetadata(
        getObjectMetadataItemMock('workspaceMember'),
      ),
    ).toBe(false);
  });
});
