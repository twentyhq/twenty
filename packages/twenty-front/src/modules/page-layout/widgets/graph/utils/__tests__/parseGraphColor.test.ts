import { parseGraphColor } from '@/page-layout/widgets/graph/utils/parseGraphColor';

describe('parseGraphColor', () => {
  it('should return "auto" for "auto" string', () => {
    expect(parseGraphColor('auto')).toBe('auto');
  });

  it('should return valid ThemeColor values', () => {
    expect(parseGraphColor('green')).toBe('green');
    expect(parseGraphColor('blue')).toBe('blue');
    expect(parseGraphColor('red')).toBe('red');
    expect(parseGraphColor('purple')).toBe('purple');
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
