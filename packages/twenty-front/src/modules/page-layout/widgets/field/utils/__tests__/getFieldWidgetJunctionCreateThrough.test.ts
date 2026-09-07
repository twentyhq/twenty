import { resolveJunctionConfig } from '@/object-record/record-field/ui/utils/junction/resolveJunctionConfig';
import { getFieldWidgetJunctionCreateThrough } from '@/page-layout/widgets/field/utils/getFieldWidgetJunctionCreateThrough';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';
import { getTestEnrichedObjectMetadataItemsMock } from '~/testing/utils/getTestEnrichedObjectMetadataItemsMock';

const objectMetadataItems = getTestEnrichedObjectMetadataItemsMock();

const personObjectMetadataItem = getMockObjectMetadataItemOrThrow('person');
const employmentHistoryObjectMetadataItem =
  getMockObjectMetadataItemOrThrow('employmentHistory');

const personPreviousCompaniesField = personObjectMetadataItem.fields.find(
  (field) => field.name === 'previousCompanies',
);

const resolvePreviousCompaniesJunctionConfig = () => {
  const junctionConfig = resolveJunctionConfig({
    settings: personPreviousCompaniesField?.settings,
    relationObjectMetadataId:
      personPreviousCompaniesField?.relation?.targetObjectMetadata.id ?? '',
    relationTargetFieldMetadataId:
      personPreviousCompaniesField?.relation?.targetFieldMetadata.id,
    sourceObjectMetadataId: personObjectMetadataItem.id,
    objectMetadataItems,
  });

  if (!junctionConfig?.isValid) {
    throw new Error('Expected a valid junction config');
  }

  return junctionConfig;
};

describe('getFieldWidgetJunctionCreateThrough', () => {
  it('should link a picked target record to the current record through the junction', () => {
    const createThrough = getFieldWidgetJunctionCreateThrough({
      junctionConfig: resolvePreviousCompaniesJunctionConfig(),
      sourceObjectMetadataItem: personObjectMetadataItem,
      objectMetadataItems,
      recordId: 'current-person-id',
    });

    expect(createThrough).toEqual({
      junctionObjectMetadataId: employmentHistoryObjectMetadataItem.id,
      junctionObjectMetadataNameSingular: 'employmentHistory',
      sourceJoinColumnName: 'personId',
      sourceRecordId: 'current-person-id',
      targetJoinColumnName: 'companyId',
      targetObjectMetadataNameSingular: 'company',
      // Companies already linked to the current person are not pickable again.
      targetRecordsFilter: {
        not: { previousEmployees: { personId: { eq: 'current-person-id' } } },
      },
    });
  });

  it('should return undefined for a morph junction', () => {
    expect(
      getFieldWidgetJunctionCreateThrough({
        junctionConfig: {
          ...resolvePreviousCompaniesJunctionConfig(),
          isMorphRelation: true,
        },
        sourceObjectMetadataItem: personObjectMetadataItem,
        objectMetadataItems,
        recordId: 'current-person-id',
      }),
    ).toBeUndefined();
  });
});
