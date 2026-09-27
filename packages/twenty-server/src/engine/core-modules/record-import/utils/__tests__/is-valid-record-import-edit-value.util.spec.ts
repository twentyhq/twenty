import { FieldMetadataType } from 'twenty-shared/types';
import { type SpreadsheetImportFieldDescriptor } from 'twenty-shared/utils';

import { isValidRecordImportEditValue } from 'src/engine/core-modules/record-import/utils/is-valid-record-import-edit-value.util';

const buildField = (
  fieldType: SpreadsheetImportFieldDescriptor['fieldType'],
): SpreadsheetImportFieldDescriptor => ({
  key: 'field',
  label: 'Field',
  fieldMetadataItemId: 'field-id',
  fieldMetadataType: FieldMetadataType.TEXT,
  fieldType,
  fieldValidationDefinitions: [],
  isNestedField: false,
});

describe('isValidRecordImportEditValue', () => {
  const options = [{ label: 'Lead', value: 'LEAD' }];

  it('accepts only existing option values for selects', () => {
    const select = buildField({ type: 'select', options });

    expect(isValidRecordImportEditValue('LEAD', select)).toBe(true);
    expect(isValidRecordImportEditValue('OTHER', select)).toBe(false);
    expect(isValidRecordImportEditValue('', select)).toBe(true);
  });

  it('accepts JSON arrays of existing values for multi-selects', () => {
    const multiSelect = buildField({ type: 'multiSelect', options });

    expect(isValidRecordImportEditValue('["LEAD"]', multiSelect)).toBe(true);
    expect(isValidRecordImportEditValue('["OTHER"]', multiSelect)).toBe(false);
    expect(isValidRecordImportEditValue('LEAD', multiSelect)).toBe(false);
  });

  it('accepts booleans only for checkboxes and caps text length', () => {
    expect(
      isValidRecordImportEditValue(true, buildField({ type: 'checkbox' })),
    ).toBe(true);
    expect(
      isValidRecordImportEditValue(true, buildField({ type: 'input' })),
    ).toBe(false);
    expect(
      isValidRecordImportEditValue(
        'x'.repeat(40_000),
        buildField({ type: 'input' }),
      ),
    ).toBe(false);
    expect(
      isValidRecordImportEditValue({}, buildField({ type: 'input' })),
    ).toBe(false);
  });
});
