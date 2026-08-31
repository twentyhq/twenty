import { generateDepthRecordGqlFieldsFromFields } from '@/object-record/graphql/record-gql-fields/utils/generateDepthRecordGqlFieldsFromFields';
import { resolveReverseJunctionConfig } from '@/object-record/record-field/ui/utils/junction/getReverseJunctionConfig';
import { getTestEnrichedObjectMetadataItemsMock } from '~/testing/utils/getTestEnrichedObjectMetadataItemsMock';
import { getMockFieldMetadataItemOrThrow } from '~/testing/utils/getMockFieldMetadataItemOrThrow';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';

describe('resolveReverseJunctionConfig', () => {
  const objectMetadataItems = getTestEnrichedObjectMetadataItemsMock();
  const companyMetadata = getMockObjectMetadataItemOrThrow('company');

  it.each([
    {
      reverseFieldName: 'noteTargets',
      junctionObjectNameSingular: 'noteTarget',
      targetFieldName: 'note',
    },
    {
      reverseFieldName: 'taskTargets',
      junctionObjectNameSingular: 'taskTarget',
      targetFieldName: 'task',
    },
  ])(
    'normalizes $reverseFieldName into source and target fields',
    ({ reverseFieldName, junctionObjectNameSingular, targetFieldName }) => {
      const reverseField = getMockFieldMetadataItemOrThrow({
        objectMetadataItem: companyMetadata,
        fieldName: reverseFieldName,
      });
      const junctionObjectMetadata = getMockObjectMetadataItemOrThrow(
        junctionObjectNameSingular,
      );

      const result = resolveReverseJunctionConfig({
        junctionObjectMetadataId: junctionObjectMetadata.id,
        relationTargetFieldMetadataId:
          reverseField.relation?.targetFieldMetadata.id,
        sourceObjectMetadataId: companyMetadata.id,
        objectMetadataItems,
      });

      expect(result).toMatchObject({
        status: 'resolved',
        junctionConfig: {
          junctionObjectMetadata: { id: junctionObjectMetadata.id },
          sourceField: { id: reverseField.relation?.targetFieldMetadata.id },
          targetFields: [{ name: targetFieldName }],
          isMorphRelation: false,
        },
      });
    },
  );

  it('returns not-found when no junction targets the source object', () => {
    expect(
      resolveReverseJunctionConfig({
        junctionObjectMetadataId:
          getMockObjectMetadataItemOrThrow('noteTarget').id,
        relationTargetFieldMetadataId: 'unsupported-target-field-id',
        sourceObjectMetadataId: 'unsupported-object-id',
        objectMetadataItems,
      }),
    ).toEqual({ status: 'not-found' });
  });

  it('collapses distinct owning-object branches of the same morph field', () => {
    const petMetadata = getMockObjectMetadataItemOrThrow('pet');
    const caretakersField = getMockFieldMetadataItemOrThrow({
      objectMetadataItem: petMetadata,
      fieldName: 'caretakers',
    });
    const petCareAgreementMetadata =
      getMockObjectMetadataItemOrThrow('petCareAgreement');

    expect(
      resolveReverseJunctionConfig({
        junctionObjectMetadataId: petCareAgreementMetadata.id,
        relationTargetFieldMetadataId:
          caretakersField.relation?.targetFieldMetadata.id,
        sourceObjectMetadataId: petMetadata.id,
        objectMetadataItems,
      }),
    ).toMatchObject({
      status: 'resolved',
      junctionConfig: {
        sourceField: { name: 'pet' },
        targetFields: [{ name: 'caretaker' }],
        isMorphRelation: true,
      },
    });
  });

  it('generates reverse relation fields without activity-specific names', () => {
    const noteTargetsField = getMockFieldMetadataItemOrThrow({
      objectMetadataItem: companyMetadata,
      fieldName: 'noteTargets',
    });

    const result = generateDepthRecordGqlFieldsFromFields({
      objectMetadataItems,
      sourceObjectMetadataItem: companyMetadata,
      fields: [noteTargetsField],
      depth: 1,
    });

    expect(result).toMatchObject({
      noteTargets: {
        id: true,
        note: {
          id: true,
          title: true,
        },
      },
    });
  });
});
