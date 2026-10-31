import { isDefined } from 'twenty-shared/utils';

import { getRelatedRecordPathSteps } from '@/related-record-paths/utils/getRelatedRecordPathSteps';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';
import { getTestEnrichedObjectMetadataItemsMock } from '~/testing/utils/getTestEnrichedObjectMetadataItemsMock';

const objectMetadataItems = getTestEnrichedObjectMetadataItemsMock();
const company = getMockObjectMetadataItemOrThrow('company');
const noteTarget = getMockObjectMetadataItemOrThrow('noteTarget');

const getFieldOrThrow = ({
  objectMetadataItem,
  fieldName,
}: {
  objectMetadataItem: Pick<typeof company, 'fields'>;
  fieldName: string;
}) => {
  const field = objectMetadataItem.fields.find(
    (candidate) => candidate.name === fieldName,
  );

  if (!isDefined(field)) {
    throw new Error(`Field ${fieldName} not found`);
  }

  return field;
};

const companyNoteTargets = getFieldOrThrow({
  objectMetadataItem: company,
  fieldName: 'noteTargets',
});
const noteTargetNote = getFieldOrThrow({
  objectMetadataItem: noteTarget,
  fieldName: 'note',
});

describe('getRelatedRecordPathSteps', () => {
  it('should follow each field from the object reached by the previous one', () => {
    const steps = getRelatedRecordPathSteps({
      sourceObjectMetadataItem: company,
      fieldMetadataIds: [companyNoteTargets.id, noteTargetNote.id],
      objectMetadataItems,
    });

    expect(
      steps.map(({ fieldMetadataItem, targetObjectMetadataItem }) => [
        fieldMetadataItem.name,
        targetObjectMetadataItem.nameSingular,
      ]),
    ).toEqual([
      ['noteTargets', 'noteTarget'],
      ['note', 'note'],
    ]);
  });

  it('should stop at a field that does not belong to the reached object', () => {
    const steps = getRelatedRecordPathSteps({
      sourceObjectMetadataItem: company,
      fieldMetadataIds: [noteTargetNote.id],
      objectMetadataItems,
    });

    expect(steps).toEqual([]);
  });
});
