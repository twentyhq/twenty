import { humanizeSubFieldLabel } from 'src/modules/dashboard/tools/utils/humanize-sub-field-label.util';

describe('humanizeSubFieldLabel', () => {
  it('returns empty string for empty input', () => {
    expect(humanizeSubFieldLabel('')).toBe('');
  });

  it('handles camelCase field names', () => {
    expect(humanizeSubFieldLabel('addressCity')).toBe('Address City');
    expect(humanizeSubFieldLabel('firstName')).toBe('First Name');
    expect(humanizeSubFieldLabel('primaryEmailAddress')).toBe(
      'Primary Email Address',
    );
  });

  it('handles single word', () => {
    expect(humanizeSubFieldLabel('id')).toBe('Id');
    expect(humanizeSubFieldLabel('name')).toBe('Name');
  });

  it('handles snake_case field names', () => {
    expect(humanizeSubFieldLabel('address_city')).toBe('Address City');
    expect(humanizeSubFieldLabel('first_name')).toBe('First Name');
  });

  it('handles kebab-case field names', () => {
    expect(humanizeSubFieldLabel('address-city')).toBe('Address City');
  });

  it('handles mixed separators', () => {
    expect(humanizeSubFieldLabel('address_cityName')).toBe('Address City Name');
  });

  it('handles consecutive separators', () => {
    expect(humanizeSubFieldLabel('foo__bar')).toBe('Foo Bar');
    expect(humanizeSubFieldLabel('foo--bar')).toBe('Foo Bar');
  });

  it('handles uppercase input', () => {
    expect(humanizeSubFieldLabel('ADDRESS')).toBe('Address');
  });

  it('handles whitespace', () => {
    expect(humanizeSubFieldLabel('  firstName  ')).toBe('First Name');
  });

  it('handles numbers in field names', () => {
    expect(humanizeSubFieldLabel('address2City')).toBe('Address2 City');
  });
});
