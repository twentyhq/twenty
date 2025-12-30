import { parseApolloStoreFieldName } from '~/utils/parseApolloStoreFieldName';

describe('parseApolloStoreFieldName', () => {
  it('returns an empty object if string is not a valid store field name', () => {
    const result = parseApolloStoreFieldName('////');
    expect(result).toEqual({});
  });

  it('returns the field name and parsed variables if they exist', () => {
    const result = parseApolloStoreFieldName('fieldName({"key":"value"})');
    expect(result).toEqual({
      fieldName: 'fieldName',
      fieldVariables: { key: 'value' },
    });
  });

  it('returns only the field name if the variables cannot be parsed', () => {
    const result = parseApolloStoreFieldName('fieldName(notJson)');
    expect(result).toEqual({
      fieldName: 'fieldName',
    });
  });

  it('returns only the field name if there are no variables', () => {
    const result = parseApolloStoreFieldName('fieldName');
    expect(result).toEqual({
      fieldName: 'fieldName',
    });
  });
});
