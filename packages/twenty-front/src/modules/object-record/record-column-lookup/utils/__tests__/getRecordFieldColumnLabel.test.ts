import { getRecordFieldColumnLabel } from '@/object-record/record-column-lookup/utils/getRecordFieldColumnLabel';

describe('getRecordFieldColumnLabel', () => {
  it.each([
    {
      title: 'the field label',
      recordField: {},
      lookupTargetFieldMetadataItem: undefined,
      expected: 'Company',
    },
    {
      title: 'the relation and looked-up field',
      recordField: {},
      lookupTargetFieldMetadataItem: { label: 'Employees' },
      expected: 'Company › Employees',
    },
    {
      title: 'the custom column name over everything',
      recordField: { settings: { label: 'Team size' } },
      lookupTargetFieldMetadataItem: { label: 'Employees' },
      expected: 'Team size',
    },
  ])(
    'shows $title',
    ({ recordField, lookupTargetFieldMetadataItem, expected }) => {
      expect(
        getRecordFieldColumnLabel({
          recordField,
          fieldMetadataItem: { label: 'Company' },
          lookupTargetFieldMetadataItem,
        }),
      ).toBe(expected);
    },
  );
});
