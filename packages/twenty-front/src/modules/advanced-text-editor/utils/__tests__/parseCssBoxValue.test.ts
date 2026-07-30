import { parseCssBoxValue } from '@/advanced-text-editor/utils/parseCssBoxValue';
import { serializeCssBoxValue } from '@/advanced-text-editor/utils/serializeCssBoxValue';

describe('parseCssBoxValue', () => {
  it('should expand one value to all sides', () => {
    expect(parseCssBoxValue('12px')).toEqual({
      top: '12px',
      right: '12px',
      bottom: '12px',
      left: '12px',
    });
  });

  it('should expand two values to vertical and horizontal', () => {
    expect(parseCssBoxValue('10px 20px')).toEqual({
      top: '10px',
      right: '20px',
      bottom: '10px',
      left: '20px',
    });
  });

  it('should expand three values per the CSS rules', () => {
    expect(parseCssBoxValue('1px 2px 3px')).toEqual({
      top: '1px',
      right: '2px',
      bottom: '3px',
      left: '2px',
    });
  });

  it('should keep four explicit values', () => {
    expect(parseCssBoxValue('1px 2px 3px 4px')).toEqual({
      top: '1px',
      right: '2px',
      bottom: '3px',
      left: '4px',
    });
  });

  it('should handle empty input', () => {
    expect(parseCssBoxValue('')).toEqual({
      top: '',
      right: '',
      bottom: '',
      left: '',
    });
  });
});

describe('serializeCssBoxValue', () => {
  it('should collapse equal sides to one value', () => {
    expect(
      serializeCssBoxValue({
        top: '12px',
        right: '12px',
        bottom: '12px',
        left: '12px',
      }),
    ).toBe('12px');
  });

  it('should collapse symmetric sides to two values', () => {
    expect(
      serializeCssBoxValue({
        top: '10px',
        right: '20px',
        bottom: '10px',
        left: '20px',
      }),
    ).toBe('10px 20px');
  });

  it('should keep four distinct values', () => {
    expect(
      serializeCssBoxValue({
        top: '1px',
        right: '2px',
        bottom: '3px',
        left: '4px',
      }),
    ).toBe('1px 2px 3px 4px');
  });

  it('should round-trip through parseCssBoxValue', () => {
    expect(serializeCssBoxValue(parseCssBoxValue('10px 20px 30px'))).toBe(
      '10px 20px 30px 20px',
    );
  });
});
