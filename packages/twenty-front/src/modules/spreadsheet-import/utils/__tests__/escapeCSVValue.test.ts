import { escapeCSVValue } from '@/spreadsheet-import/utils/escapeCSVValue';

describe('escapeCSVValue', () => {
  it('should escape values with commas, quotes, newlines and carriage returns', () => {
    expect(escapeCSVValue('test,test')).toBe('"test,test"');
  });

  it('should escape array or JSON values', () => {
    expect(escapeCSVValue(['test', 'test'])).toBe('"[""test"",""test""]"');
    expect(escapeCSVValue({ test: 'test' })).toBe('"{""test"":""test""}"');
  });

  it('should escape null values', () => {
    expect(escapeCSVValue(null)).toBe('');
  });

  it('should escape simple string value', () => {
    expect(escapeCSVValue('test')).toBe('test');
  });

  it('should escape simple number value', () => {
    expect(escapeCSVValue(1)).toBe('1');
  });
});
