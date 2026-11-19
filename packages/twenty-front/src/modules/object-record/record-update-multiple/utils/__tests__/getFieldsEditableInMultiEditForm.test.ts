import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { getFieldsEditableInMultiEditForm } from '@/object-record/record-update-multiple/utils/getFieldsEditableInMultiEditForm';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';

const opportunityObjectMetadataItem =
  getMockObjectMetadataItemOrThrow('opportunity');

const getEditableFieldNames = (
  objectMetadataItem: Pick<EnrichedObjectMetadataItem, 'updatableFields'>,
) =>
  getFieldsEditableInMultiEditForm(objectMetadataItem).map(
    (field) => field.name,
  );

describe('getFieldsEditableInMultiEditForm', () => {
  it('should offer a field the role can update', () => {
    expect(getEditableFieldNames(opportunityObjectMetadataItem)).toContain(
      'stage',
    );
  });

  it('should not offer a field the role cannot update', () => {
    expect(
      getEditableFieldNames({
        updatableFields: opportunityObjectMetadataItem.updatableFields.filter(
          (field) => field.name !== 'stage',
        ),
      }),
    ).not.toContain('stage');
  });

  it('should sort the offered fields by name', () => {
    const editableFieldNames = getEditableFieldNames({
      updatableFields: [
        ...opportunityObjectMetadataItem.updatableFields,
      ].reverse(),
    });

    expect(editableFieldNames).toEqual(
      [...editableFieldNames].sort((fieldNameA, fieldNameB) =>
        fieldNameA.localeCompare(fieldNameB),
      ),
    );
  });
});
