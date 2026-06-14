import { filterFieldsForRecordTableViewCreation } from '@/page-layout/widgets/record-table/utils/filterFieldsForRecordTableViewCreation';
import { getMockFieldMetadataItemOrThrow } from '~/testing/utils/getMockFieldMetadataItemOrThrow';
import { getMockObjectMetadataItemOrThrow } from '~/testing/utils/getMockObjectMetadataItemOrThrow';

describe('filterFieldsForRecordTableViewCreation', () => {
  const objectMetadataItem = getMockObjectMetadataItemOrThrow('company');
  const labelIdentifierFieldMetadataId =
    objectMetadataItem.labelIdentifierFieldMetadataId;

  // domainName is an active, non-system field that is not the label identifier
  const nonSystemField = getMockFieldMetadataItemOrThrow({
    objectMetadataItem,
    fieldName: 'domainName',
  });
  // id is a hidden system field
  const systemField = getMockFieldMetadataItemOrThrow({
    objectMetadataItem,
    fieldName: 'id',
  });
  // position is a hidden system field
  const hiddenSystemField = getMockFieldMetadataItemOrThrow({
    objectMetadataItem,
    fieldName: 'position',
  });

  it('should include active non-system fields', () => {
    expect(
      filterFieldsForRecordTableViewCreation(
        nonSystemField,
        labelIdentifierFieldMetadataId,
      ),
    ).toBe(true);
  });

  it('should exclude inactive fields', () => {
    expect(
      filterFieldsForRecordTableViewCreation(
        { ...nonSystemField, isActive: false },
        labelIdentifierFieldMetadataId,
      ),
    ).toBe(false);
  });

  it('should exclude system fields that are not the label identifier', () => {
    expect(
      filterFieldsForRecordTableViewCreation(
        systemField,
        labelIdentifierFieldMetadataId,
      ),
    ).toBe(false);
  });

  it('should include system fields when they are the label identifier', () => {
    expect(
      filterFieldsForRecordTableViewCreation(systemField, systemField.id),
    ).toBe(true);
  });

  it('should include hidden system fields when they are the label identifier', () => {
    expect(
      filterFieldsForRecordTableViewCreation(
        hiddenSystemField,
        hiddenSystemField.id,
      ),
    ).toBe(true);
  });
});
