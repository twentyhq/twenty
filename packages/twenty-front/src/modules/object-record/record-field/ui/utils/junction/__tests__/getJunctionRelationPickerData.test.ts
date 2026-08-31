import { getJunctionRelationPickerData } from '@/object-record/record-field/ui/utils/junction/getJunctionRelationPickerData';
import { getJunctionConfig } from '@/object-record/record-field/ui/utils/junction/getJunctionConfig';
import { getObjectMorphJunctionConfig } from '@/object-record/record-field/ui/utils/junction/getObjectMorphJunctionConfig';
import { getMockFieldMetadataItemOrThrow } from '~/testing/utils/getMockFieldMetadataItemOrThrow';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';
import { getTestEnrichedObjectMetadataItemsMock } from '~/testing/utils/getTestEnrichedObjectMetadataItemsMock';

describe('getJunctionRelationPickerData', () => {
  it('uses morph targets instead of junction records as picker items', () => {
    const objectMetadataItems = getTestEnrichedObjectMetadataItemsMock();
    const taskObjectMetadata = getMockObjectMetadataItemOrThrow('task');
    const taskTargetObjectMetadata =
      getMockObjectMetadataItemOrThrow('taskTarget');
    const companyObjectMetadata = getMockObjectMetadataItemOrThrow('company');
    const personObjectMetadata = getMockObjectMetadataItemOrThrow('person');

    const junctionConfig = getObjectMorphJunctionConfig({
      objectMetadata: taskObjectMetadata,
      objectMetadataItems,
    });

    expect(junctionConfig).not.toBeNull();

    if (junctionConfig === null) {
      throw new Error('Task morph junction config not found');
    }

    const { pickableMorphItems, searchableObjectMetadataItems } =
      getJunctionRelationPickerData({
        junctionRecords: [
          {
            id: 'task-target-company-id',
            __typename: 'TaskTarget',
            targetCompany: { id: 'company-id' },
          },
          {
            id: 'task-target-person-id',
            __typename: 'TaskTarget',
            targetPerson: { id: 'person-id' },
          },
        ],
        targetFields: junctionConfig.targetFields,
        objectMetadataItems,
      });

    expect(pickableMorphItems).toEqual([
      {
        recordId: 'company-id',
        objectMetadataId: companyObjectMetadata.id,
        isSelected: true,
        isMatchingSearchFilter: true,
      },
      {
        recordId: 'person-id',
        objectMetadataId: personObjectMetadata.id,
        isSelected: true,
        isMatchingSearchFilter: true,
      },
    ]);

    const searchableObjectMetadataIds = searchableObjectMetadataItems.map(
      ({ id }) => id,
    );
    const morphTargetObjectMetadataIds = junctionConfig.targetFields.flatMap(
      (targetField) =>
        targetField.morphRelations?.map(
          ({ targetObjectMetadata }) => targetObjectMetadata.id,
        ) ?? [],
    );

    expect([...searchableObjectMetadataIds].sort()).toEqual(
      [...morphTargetObjectMetadataIds].sort(),
    );
    expect(searchableObjectMetadataIds).not.toContain(
      taskTargetObjectMetadata.id,
    );
  });

  it('keeps terminal records and metadata for a regular junction', () => {
    const objectMetadataItems = getTestEnrichedObjectMetadataItemsMock();
    const personObjectMetadata = getMockObjectMetadataItemOrThrow('person');
    const companyObjectMetadata = getMockObjectMetadataItemOrThrow('company');
    const previousCompaniesField = getMockFieldMetadataItemOrThrow({
      objectMetadataItem: personObjectMetadata,
      fieldName: 'previousCompanies',
    });

    const junctionConfig = getJunctionConfig({
      settings: previousCompaniesField.settings,
      relationObjectMetadataId:
        previousCompaniesField.relation?.targetObjectMetadata.id ?? '',
      relationTargetFieldMetadataId:
        previousCompaniesField.relation?.targetFieldMetadata.id,
      sourceObjectMetadataId: personObjectMetadata.id,
      objectMetadataItems,
    });

    expect(junctionConfig).not.toBeNull();

    if (junctionConfig === null) {
      throw new Error('Previous companies junction config not found');
    }

    const { pickableMorphItems, searchableObjectMetadataItems } =
      getJunctionRelationPickerData({
        junctionRecords: [
          {
            id: 'employment-history-id',
            __typename: 'EmploymentHistory',
            company: { id: 'company-id' },
          },
        ],
        targetFields: junctionConfig.targetFields,
        objectMetadataItems,
      });

    expect(pickableMorphItems).toEqual([
      {
        recordId: 'company-id',
        objectMetadataId: companyObjectMetadata.id,
        isSelected: true,
        isMatchingSearchFilter: true,
      },
    ]);
    expect(searchableObjectMetadataItems.map(({ id }) => id)).toEqual([
      companyObjectMetadata.id,
    ]);
  });
});
