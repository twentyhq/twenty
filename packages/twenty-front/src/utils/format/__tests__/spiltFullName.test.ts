import { splitFullName } from '~/utils/format/spiltFullName';

describe('splitFullName', () => {
  it('should split a full name with two parts', () => {
    const result = splitFullName('John Doe');
    expect(result).toEqual(['John', 'Doe']);
  });

  it('should handle names with extra whitespace', () => {
    const result = splitFullName('  John   Doe  ');
    expect(result).toEqual(['John', 'Doe']);
  });

  it('should handle single name', () => {
    const result = splitFullName('John');
    expect(result).toEqual(['John', '']);
  });

  it('should handle empty string', () => {
    const result = splitFullName('');
    expect(result).toEqual(['', '']);
  });

  it('should handle only whitespace', () => {
    const result = splitFullName('   ');
    expect(result).toEqual(['', '']);
  });

  it('should handle names with more than two parts', () => {
    const result = splitFullName('John Michael Doe');
    expect(result).toEqual(['John', 'Michael']);
  });

  it('should handle names with multiple middle names', () => {
    const result = splitFullName('John Michael Christopher Doe');
    expect(result).toEqual(['John', 'Michael']);
  });

  it('should handle names with hyphenated parts', () => {
    const result = splitFullName('Mary-Jane Watson-Smith');
    expect(result).toEqual(['Mary-Jane', 'Watson-Smith']);
  });

  it('should handle names with apostrophes', () => {
    const result = splitFullName("John O'Connor");
    expect(result).toEqual(['John', "O'Connor"]);
  });

  it('should handle names with special characters', () => {
    const result = splitFullName('José García-López');
    expect(result).toEqual(['José', 'García-López']);
  });

  it('should handle names with multiple consecutive spaces', () => {
    const result = splitFullName('John     Doe');
    expect(result).toEqual(['John', 'Doe']);
  });

  it('should handle names with tabs and newlines', () => {
    const result = splitFullName('John\t\nDoe');
    expect(result).toEqual(['John', 'Doe']);
  });

  it('should handle very long names', () => {
    const result = splitFullName(
      'John Michael Christopher Alexander Doe Smith Johnson',
    );
    expect(result).toEqual(['John', 'Michael']);
  });

  it('should handle single character names', () => {
    const result = splitFullName('J D');
    expect(result).toEqual(['J', 'D']);
  });

  it('should handle names with numbers', () => {
    const result = splitFullName('John Doe II');
    expect(result).toEqual(['John', 'Doe']);
  });
});
