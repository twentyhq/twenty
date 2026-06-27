import { generateDepthRecordGqlFieldsFromFields } from '@/object-record/graphql/record-gql-fields/utils/generateDepthRecordGqlFieldsFromFields';
import { type FieldMetadataItem } from '@/object-metadata/types/FieldMetadataItem';
import { FieldMetadataType } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';
import { getTestEnrichedObjectMetadataItemsMock } from '~/testing/utils/getTestEnrichedObjectMetadataItemsMock';

describe('generateDepthRecordGqlFieldsFromFields', () => {
  const objectMetadataItems = getTestEnrichedObjectMetadataItemsMock();

  const getFieldOrThrow = (
    objectNameSingular: string,
    fieldName: string,
  ): FieldMetadataItem => {
    const field = getMockObjectMetadataItemOrThrow(
      objectNameSingular,
    ).fields.find((item) => item.name === fieldName);

    if (!isDefined(field)) {
      throw new Error(
        `Field ${fieldName} not found on ${objectNameSingular} mock`,
      );
    }

    return field;
  };

  it('should skip a morph target whose object metadata has been deleted instead of throwing', () => {
    // `timelineActivity.target` is a morph relation targeting many objects.
    // Simulate one of them (opportunity) being deleted by removing it from the
    // available object metadata items.
    const targetField = getFieldOrThrow('timelineActivity', 'target');

    const objectMetadataItemsWithoutOpportunity = objectMetadataItems.filter(
      (item) => item.nameSingular !== 'opportunity',
    );

    let result: Record<string, unknown> = {};

    expect(() => {
      result = generateDepthRecordGqlFieldsFromFields({
        objectMetadataItems: objectMetadataItemsWithoutOpportunity,
        fields: [targetField],
        depth: 1,
      });
    }).not.toThrow();

    // The deleted morph target is dropped, the others remain.
    expect(result).not.toHaveProperty('targetOpportunity');
    expect(result).not.toHaveProperty('targetOpportunityId');
    expect(result).toHaveProperty('targetCompany');
  });

  it('should skip a relation whose target object metadata has been deleted instead of throwing', () => {
    const targetField = getFieldOrThrow('timelineActivity', 'target');

    const relationField: FieldMetadataItem = {
      ...targetField,
      type: FieldMetadataType.RELATION,
      morphRelations: null,
      relation: targetField.morphRelations?.[0] ?? null,
    };

    const targetObjectId =
      relationField.relation?.targetObjectMetadata.id ?? '';

    const objectMetadataItemsWithoutTarget = objectMetadataItems.filter(
      (item) => item.id !== targetObjectId,
    );

    expect(() => {
      generateDepthRecordGqlFieldsFromFields({
        objectMetadataItems: objectMetadataItemsWithoutTarget,
        fields: [relationField],
        depth: 1,
      });
    }).not.toThrow();
  });
});
