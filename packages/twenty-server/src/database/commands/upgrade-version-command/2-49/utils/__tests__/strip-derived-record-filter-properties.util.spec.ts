import { stripDerivedRecordFilterProperties } from 'src/database/commands/upgrade-version-command/2-49/utils/strip-derived-record-filter-properties.util';

describe('stripDerivedRecordFilterProperties', () => {
  it('should keep only the properties that reference the field', () => {
    expect(
      stripDerivedRecordFilterProperties({
        recordFilter: {
          id: 'filter-id',
          type: 'TEXT',
          label: 'Name',
          value: '{{trigger.name}}',
          displayValue: '{{trigger.name}}',
          operand: 'CONTAINS',
          fieldMetadataId: 'field-id',
          recordFilterGroupId: 'group-id',
        },
      }),
    ).toEqual({
      id: 'filter-id',
      value: '{{trigger.name}}',
      operand: 'CONTAINS',
      fieldMetadataId: 'field-id',
      recordFilterGroupId: 'group-id',
    });
  });

  it('should encode a value that is not a string', () => {
    expect(
      stripDerivedRecordFilterProperties({
        recordFilter: {
          fieldMetadataId: 'field-id',
          operand: 'IS',
          value: ['ACME'],
        },
      }),
    ).toEqual({
      fieldMetadataId: 'field-id',
      operand: 'IS',
      value: '["ACME"]',
    });
  });

  it('should leave a missing id or value missing', () => {
    expect(
      stripDerivedRecordFilterProperties({
        recordFilter: { fieldMetadataId: 'field-id', operand: 'IS_EMPTY' },
      }),
    ).toEqual({ fieldMetadataId: 'field-id', operand: 'IS_EMPTY' });
  });
});
