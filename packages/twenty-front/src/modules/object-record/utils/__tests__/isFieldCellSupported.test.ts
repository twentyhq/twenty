import { isFieldCellSupported } from '@/object-record/utils/isFieldCellSupported';
import { getMockFieldMetadataItemOrThrow } from '~/testing/utils/getMockFieldMetadataItemOrThrow';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';
import { getTestEnrichedObjectMetadataItemsMock } from '~/testing/utils/getTestEnrichedObjectMetadataItemsMock';

describe('isFieldCellSupported', () => {
  const objectMetadataItems = getTestEnrichedObjectMetadataItemsMock();
  const taskMetadata = getMockObjectMetadataItemOrThrow('task');
  const taskTargetsField = getMockFieldMetadataItemOrThrow({
    objectMetadataItem: taskMetadata,
    fieldName: 'taskTargets',
  });

  it('supports a valid configured junction field', () => {
    expect(isFieldCellSupported(taskTargetsField, objectMetadataItems)).toBe(
      true,
    );
  });

  it('does not advertise an invalid configured junction as editable', () => {
    if (!taskTargetsField.relation) {
      throw new Error('Task targets relation not found');
    }

    const invalidTaskTargetsField = {
      ...taskTargetsField,
      settings: {
        ...taskTargetsField.settings,
        junctionTargetFieldId: taskTargetsField.relation.targetFieldMetadata.id,
      },
    };

    expect(
      isFieldCellSupported(invalidTaskTargetsField, objectMetadataItems),
    ).toBe(false);
  });
});
