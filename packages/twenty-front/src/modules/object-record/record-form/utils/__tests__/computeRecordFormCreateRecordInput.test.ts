import { computeRecordFormCreateRecordInput } from '@/object-record/record-form/utils/computeRecordFormCreateRecordInput';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';
import { getTestEnrichedObjectMetadataItemsMock } from '~/testing/utils/getTestEnrichedObjectMetadataItemsMock';

describe('computeRecordFormCreateRecordInput', () => {
  const objectMetadataItems = getTestEnrichedObjectMetadataItemsMock();
  const petObjectMetadataItem = getMockObjectMetadataItemOrThrow('pet');
  const rocketObjectMetadataId = getMockObjectMetadataItemOrThrow('rocket').id;

  it('maps a morph relation selection to its target join column', () => {
    const createRecordInput = computeRecordFormCreateRecordInput({
      draftRecord: {
        name: 'Rex',
        polymorphicOwner: {
          targetObjectMetadataId: rocketObjectMetadataId,
          id: 'record-id',
        },
      },
      fieldMetadataItems: petObjectMetadataItem.fields,
      objectMetadataItems,
    });

    expect(createRecordInput).toEqual({
      name: 'Rex',
      polymorphicOwnerRocketId: 'record-id',
    });
  });

  it('drops a cleared morph relation value without emitting join columns', () => {
    const createRecordInput = computeRecordFormCreateRecordInput({
      draftRecord: {
        name: 'Rex',
        polymorphicOwner: null,
      },
      fieldMetadataItems: petObjectMetadataItem.fields,
      objectMetadataItems,
    });

    expect(createRecordInput).toEqual({ name: 'Rex' });
  });

  it('keeps non-morph draft values untouched, including caller-provided keys', () => {
    const createRecordInput = computeRecordFormCreateRecordInput({
      draftRecord: {
        name: 'Rex',
        position: 'first',
      },
      fieldMetadataItems: petObjectMetadataItem.fields,
      objectMetadataItems,
    });

    expect(createRecordInput).toEqual({ name: 'Rex', position: 'first' });
  });
});
