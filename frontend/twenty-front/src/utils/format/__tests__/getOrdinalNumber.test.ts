import { getOrdinalNumber } from '~/utils/format/getOrdinalNumber';

describe('getOrdinalNumber', () => {
  it('should return correct ordinal numbers', () => {
    expect(getOrdinalNumber(1)).toBe('1st');
    expect(getOrdinalNumber(2)).toBe('2nd');
    expect(getOrdinalNumber(3)).toBe('3rd');
    expect(getOrdinalNumber(4)).toBe('4th');
    expect(getOrdinalNumber(11)).toBe('11th');
    expect(getOrdinalNumber(21)).toBe('21st');
    expect(getOrdinalNumber(22)).toBe('22nd');
    expect(getOrdinalNumber(23)).toBe('23rd');
  });
});
