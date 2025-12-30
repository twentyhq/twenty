import { convertToLabel } from '@/utils/convert-to-label';

describe('convertToLabel', () => {
  it('should convert to label', () => {
    expect(convertToLabel('toto')).toBe('Toto');
    expect(convertToLabel('totoTata')).toBe('Toto tata');
    expect(convertToLabel('totoTataTiti')).toBe('Toto tata titi');
    expect(convertToLabel('toto-tata-titi')).toBe('Toto tata titi');
  });
});
