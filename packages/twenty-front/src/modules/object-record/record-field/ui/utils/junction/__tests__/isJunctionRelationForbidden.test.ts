import { isJunctionRelationForbidden } from '@/object-record/record-field/ui/utils/junction/isJunctionRelationForbidden';
import { getMockFieldMetadataItemOrThrow } from '~/testing/utils/getMockFieldMetadataItemOrThrow';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';
import { getTestEnrichedObjectMetadataItemsMock } from '~/testing/utils/getTestEnrichedObjectMetadataItemsMock';

describe('isJunctionRelationForbidden', () => {
  it.each(['taskTargets', 'noteTargets'])(
    'does not forbid Opportunity.%s when junction objects are readable',
    (fieldName) => {
      const opportunityMetadata =
        getMockObjectMetadataItemOrThrow('opportunity');
      const fieldMetadataItem = getMockFieldMetadataItemOrThrow({
        objectMetadataItem: opportunityMetadata,
        fieldName,
      });

      expect(
        isJunctionRelationForbidden({
          fieldMetadataItem,
          sourceObjectMetadataId: opportunityMetadata.id,
          objectMetadataItems: getTestEnrichedObjectMetadataItemsMock(),
          objectPermissionsByObjectMetadataId: {},
        }),
      ).toBe(false);
    },
  );
});
