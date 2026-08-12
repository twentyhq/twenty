import { getRelatedPersonFieldMetadataItems } from '@/activities/emails/related-people/utils/getRelatedPersonFieldMetadataItems';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { FieldMetadataType, RelationType } from '~/generated-metadata/graphql';

type BuildRelationFieldParams = {
  name: string;
  targetObjectNameSingular?: string;
  relationType?: RelationType;
  isActive?: boolean;
  isSystem?: boolean;
};

const buildRelationField = ({
  name,
  targetObjectNameSingular = 'person',
  relationType = RelationType.MANY_TO_ONE,
  isActive = true,
  isSystem = false,
}: BuildRelationFieldParams) =>
  ({
    id: `field-${name}`,
    name,
    label: name,
    type: FieldMetadataType.RELATION,
    isActive,
    isSystem,
    relation: {
      type: relationType,
      targetObjectMetadata: {
        id: `object-${targetObjectNameSingular}`,
        nameSingular: targetObjectNameSingular,
        namePlural: `${targetObjectNameSingular}s`,
      },
    },
  }) as unknown as FieldMetadataItem;

const buildTextField = (name: string) =>
  ({
    id: `field-${name}`,
    name,
    label: name,
    type: FieldMetadataType.TEXT,
    isActive: true,
    isSystem: false,
  }) as unknown as FieldMetadataItem;

describe('getRelatedPersonFieldMetadataItems', () => {
  it('should return the to-one relation fields that target Person', () => {
    const result = getRelatedPersonFieldMetadataItems({
      nameSingular: 'fellowship',
      fields: [buildTextField('name'), buildRelationField({ name: 'fellow' })],
    });

    expect(result.map((field) => field.name)).toEqual(['fellow']);
  });

  it('should return every Person relation when an object has several', () => {
    const result = getRelatedPersonFieldMetadataItems({
      nameSingular: 'mentorship',
      fields: [
        buildRelationField({ name: 'mentor' }),
        buildRelationField({ name: 'mentee' }),
      ],
    });

    expect(result.map((field) => field.name)).toEqual(['mentor', 'mentee']);
  });

  it('should preserve the order the fields are declared on the object', () => {
    const result = getRelatedPersonFieldMetadataItems({
      nameSingular: 'mentorship',
      fields: [
        buildRelationField({ name: 'mentee' }),
        buildTextField('name'),
        buildRelationField({ name: 'mentor' }),
      ],
    });

    expect(result.map((field) => field.name)).toEqual(['mentee', 'mentor']);
  });

  it('should ignore relations that target something other than Person', () => {
    const result = getRelatedPersonFieldMetadataItems({
      nameSingular: 'fellowship',
      fields: [
        buildRelationField({
          name: 'sponsor',
          targetObjectNameSingular: 'company',
        }),
      ],
    });

    expect(result).toEqual([]);
  });

  it('should ignore to-many relations, which have no single recipient', () => {
    const result = getRelatedPersonFieldMetadataItems({
      nameSingular: 'cohort',
      fields: [
        buildRelationField({
          name: 'members',
          relationType: RelationType.ONE_TO_MANY,
        }),
      ],
    });

    expect(result).toEqual([]);
  });

  it('should ignore deactivated fields', () => {
    const result = getRelatedPersonFieldMetadataItems({
      nameSingular: 'fellowship',
      fields: [buildRelationField({ name: 'fellow', isActive: false })],
    });

    expect(result).toEqual([]);
  });

  it('should ignore system fields', () => {
    const result = getRelatedPersonFieldMetadataItems({
      nameSingular: 'fellowship',
      fields: [buildRelationField({ name: 'fellow', isSystem: true })],
    });

    expect(result).toEqual([]);
  });

  it('should ignore non-relation fields', () => {
    const result = getRelatedPersonFieldMetadataItems({
      nameSingular: 'fellowship',
      fields: [buildTextField('fellow')],
    });

    expect(result).toEqual([]);
  });

  it('should return nothing for Person itself, which has its own action', () => {
    const result = getRelatedPersonFieldMetadataItems({
      nameSingular: 'person',
      fields: [buildRelationField({ name: 'manager' })],
    });

    expect(result).toEqual([]);
  });
});
