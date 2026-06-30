import { parseGraphColor } from '@/page-layout/widgets/graph/utils/parseGraphColor';

describe('parseGraphColor', () => {
  it('should return "auto" for "auto" string', () => {
    expect(parseGraphColor('auto')).toBe('auto');
  });

  it('should return valid ThemeColor values for lowercase input', () => {
    expect(parseGraphColor('green')).toBe('green');
    expect(parseGraphColor('blue')).toBe('blue');
    expect(parseGraphColor('red')).toBe('red');
    expect(parseGraphColor('purple')).toBe('purple');
  });

  it('should normalize uppercase colors to lowercase', () => {
    expect(parseGraphColor('GREEN')).toBe('green');
    expect(parseGraphColor('BLUE')).toBe('blue');
    expect(parseGraphColor('RED')).toBe('red');
    expect(parseGraphColor('PURPLE')).toBe('purple');
  });

  it('should normalize mixed case colors to lowercase', () => {
    expect(parseGraphColor('Green')).toBe('green');
    expect(parseGraphColor('Blue')).toBe('blue');
  });

  it('should return undefined for null', () => {
    expect(parseGraphColor(null)).toBeUndefined();
  });

  it('should return undefined for undefined', () => {
    expect(parseGraphColor(undefined)).toBeUndefined();
  });

  it('should return undefined for invalid color strings', () => {
    expect(parseGraphColor('invalid-color')).toBeUndefined();
    expect(parseGraphColor('notacolor')).toBeUndefined();
  });

  it('should return undefined for empty string', () => {
    expect(parseGraphColor('')).toBeUndefined();
  });
});
