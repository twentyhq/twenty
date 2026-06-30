import { getDropdownFocusIdForRecordField } from '@/object-record/utils/getDropdownFocusIdForRecordField';

describe('getDropdownFocusIdForRecordField', () => {
  it('should generate correct dropdown focus id for table-cell', () => {
    const result = getDropdownFocusIdForRecordField({
      recordId: 'record-123',
      fieldMetadataId: 'field-456',
      componentType: 'table-cell',
      instanceId: 'instance-789',
    });

    expect(result).toBe(
      'dropdown-instance-789-table-cell-record-record-123-field-field-456',
    );
  });

  it('should generate correct dropdown focus id for inline-cell', () => {
    const result = getDropdownFocusIdForRecordField({
      recordId: 'record-abc',
      fieldMetadataId: 'field-def',
      componentType: 'inline-cell',
      instanceId: 'instance-ghi',
    });

    expect(result).toBe(
      'dropdown-instance-ghi-inline-cell-record-record-abc-field-field-def',
    );
  });
});
