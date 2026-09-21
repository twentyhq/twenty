import { parseCssSizeValue } from '@/advanced-text-editor/utils/parseCssSizeValue';

describe('parseCssSizeValue', () => {
  it('should split amount and unit', () => {
    expect(parseCssSizeValue('600px')).toEqual({ amount: '600', unit: 'px' });
    expect(parseCssSizeValue('50%')).toEqual({ amount: '50', unit: '%' });
    expect(parseCssSizeValue('1.5em')).toEqual({ amount: '1.5', unit: 'em' });
  });

  it('should return an empty amount for non-numeric values', () => {
    expect(parseCssSizeValue('auto')).toEqual({ amount: '', unit: 'px' });
    expect(parseCssSizeValue('')).toEqual({ amount: '', unit: 'px' });
    expect(parseCssSizeValue(undefined)).toEqual({ amount: '', unit: 'px' });
  });
});
