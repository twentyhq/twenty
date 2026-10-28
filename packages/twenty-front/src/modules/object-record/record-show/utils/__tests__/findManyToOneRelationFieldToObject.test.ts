import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { findManyToOneRelationFieldToObject } from '@/object-record/record-show/utils/findManyToOneRelationFieldToObject';
import { FieldMetadataType, RelationType } from '~/generated-metadata/graphql';

const buildRelationField = ({
  name,
  relationType,
  targetObjectMetadataId,
  isActive = true,
}: {
  name: string;
  relationType: RelationType;
  targetObjectMetadataId: string;
  isActive?: boolean;
}) =>
  ({
    id: `${name}-id`,
    name,
    type: FieldMetadataType.RELATION,
    isActive,
    relation: {
      type: relationType,
      targetObjectMetadata: { id: targetObjectMetadataId },
    },
  }) as unknown as FieldMetadataItem;

describe('findManyToOneRelationFieldToObject', () => {
  it('returns the active many-to-one relation pointing at the target object', () => {
    const companyField = buildRelationField({
      name: 'company',
      relationType: RelationType.MANY_TO_ONE,
      targetObjectMetadataId: 'company-metadata-id',
    });

    expect(
      findManyToOneRelationFieldToObject({
        fields: [
          buildRelationField({
            name: 'pointOfContact',
            relationType: RelationType.MANY_TO_ONE,
            targetObjectMetadataId: 'person-metadata-id',
          }),
          companyField,
        ],
        targetObjectMetadataId: 'company-metadata-id',
      }),
    ).toBe(companyField);
  });

  it('ignores inactive and one-to-many relations', () => {
    expect(
      findManyToOneRelationFieldToObject({
        fields: [
          buildRelationField({
            name: 'company',
            relationType: RelationType.MANY_TO_ONE,
            targetObjectMetadataId: 'company-metadata-id',
            isActive: false,
          }),
          buildRelationField({
            name: 'companies',
            relationType: RelationType.ONE_TO_MANY,
            targetObjectMetadataId: 'company-metadata-id',
          }),
        ],
        targetObjectMetadataId: 'company-metadata-id',
      }),
    ).toBeUndefined();
  });
});
