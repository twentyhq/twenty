import { getRelatedRecordPathNextFieldMetadataItems } from '@/related-record-paths/utils/getRelatedRecordPathNextFieldMetadataItems';
import { getRelatedRecordPathSteps } from '@/related-record-paths/utils/getRelatedRecordPathSteps';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';
import { getTestEnrichedObjectMetadataItemsMock } from '~/testing/utils/getTestEnrichedObjectMetadataItemsMock';

const objectMetadataItems = getTestEnrichedObjectMetadataItemsMock();
const company = getMockObjectMetadataItemOrThrow('company');
const noteTarget = getMockObjectMetadataItemOrThrow('noteTarget');

const getFieldOrThrow = (
  objectMetadataItem: typeof company,
  fieldName: string,
) => {
  const field = objectMetadataItem.fields.find(
    (candidate) => candidate.name === fieldName,
  );

  if (field === undefined) {
    throw new Error(`Field ${fieldName} not found`);
  }

  return field;
};

const companyNoteTargets = getFieldOrThrow(company, 'noteTargets');
const noteTargetNote = getFieldOrThrow(noteTarget, 'note');

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
      fieldMetadataIds: [companyNoteTargets.id],
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
