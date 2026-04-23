import { formatValueForCSV } from '@/spreadsheet-import/utils/formatValueForCSV';

describe('formatValueForCSV', () => {
  it('should format values with commas, quotes, newlines and carriage returns', () => {
    expect(formatValueForCSV('test,test')).toBe('"test,test"');
  });

  it('should format array or JSON values', () => {
    expect(formatValueForCSV(['test', 'test'])).toBe('"[""test"",""test""]"');
    expect(formatValueForCSV({ test: 'test' })).toBe('"{""test"":""test""}"');
  });

  it('should format null values', () => {
    expect(formatValueForCSV(null)).toBe('');
  });

  it('should format simple string value', () => {
    expect(formatValueForCSV('test')).toBe('test');
  });

  it('should format simple number value', () => {
    expect(formatValueForCSV(1)).toBe('1');
  });
});
