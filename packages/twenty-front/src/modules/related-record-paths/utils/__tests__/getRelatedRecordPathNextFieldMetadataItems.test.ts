import { isDefined } from 'twenty-shared/utils';

import { getRelatedRecordPathNextFieldMetadataItems } from '@/related-record-paths/utils/getRelatedRecordPathNextFieldMetadataItems';
import { getRelatedRecordPathSteps } from '@/related-record-paths/utils/getRelatedRecordPathSteps';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';
import { getTestEnrichedObjectMetadataItemsMock } from '~/testing/utils/getTestEnrichedObjectMetadataItemsMock';

const objectMetadataItems = getTestEnrichedObjectMetadataItemsMock();
const company = getMockObjectMetadataItemOrThrow('company');
const companyNoteTargetsId = company.fields.find(
  (field) => field.name === 'noteTargets',
)?.id;

describe('getRelatedRecordPathNextFieldMetadataItems', () => {
  it('should offer active relation fields of the source object', () => {
    const fieldNames = getRelatedRecordPathNextFieldMetadataItems({
      sourceObjectMetadataItem: company,
      steps: [],
    }).map((field) => field.name);

    expect(fieldNames).toEqual(
      expect.arrayContaining(['noteTargets', 'people', 'accountOwner']),
    );
    expect(fieldNames).not.toContain('name');
  });

  it('should exclude relations leading back to an object already visited', () => {
    const steps = getRelatedRecordPathSteps({
      sourceObjectMetadataItem: company,
      fieldMetadataIds: [companyNoteTargetsId].filter(isDefined),
      objectMetadataItems,
    });

    const fieldNames = getRelatedRecordPathNextFieldMetadataItems({
      sourceObjectMetadataItem: company,
      steps,
    }).map((field) => field.name);

    expect(fieldNames).toContain('note');
    expect(fieldNames).not.toContain('targetCompany');
  });
});
