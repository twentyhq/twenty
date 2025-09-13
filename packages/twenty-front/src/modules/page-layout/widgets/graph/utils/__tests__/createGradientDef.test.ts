import { type GraphColorScheme } from '../../types/GraphColorScheme';
import { createGradientDef } from '../createGradientDef';
describe('createGradientDef', () => {
  const mockColorScheme: GraphColorScheme = {
    name: 'blue',
    gradient: {
      normal: ['blue1', 'blue2'],
      hover: ['blue3', 'blue4'],
    },
    solid: 'blue',
  };
  it('should create basic gradient definition', () => {
    const result = createGradientDef(mockColorScheme, 'test-gradient');
    expect(result).toEqual({
      id: 'test-gradient',
      type: 'linearGradient',
      x1: '0%',
      y1: '0%',
      x2: '0%',
      y2: '100%',
      colors: [
        { offset: 0, color: 'blue1' },
        { offset: 100, color: 'blue2' },
      ],
    });
  });
  it('should use hover colors when isHovered is true', () => {
    const result = createGradientDef(mockColorScheme, 'test-gradient', true);
    expect(result.colors).toEqual([
      { offset: 0, color: 'blue3' },
      { offset: 100, color: 'blue4' },
    ]);
  });
  it('should use normal colors when isHovered is false', () => {
    const result = createGradientDef(mockColorScheme, 'test-gradient', false);
    expect(result.colors).toEqual([
      { offset: 0, color: 'blue1' },
      { offset: 100, color: 'blue2' },
    ]);
  });
  it('should apply angle when provided', () => {
    const result = createGradientDef(
      mockColorScheme,
      'test-gradient',
      false,
      90,
    );
    const x1 = parseFloat(result.x1);
    const x2 = parseFloat(result.x2);
    expect(x1).toBeCloseTo(50, 10);
    expect(result.y1).toBe('0%');
    expect(x2).toBeCloseTo(50, 10);
    expect(result.y2).toBe('100%');
  });
  it('should reverse gradient colors when reverseGradient is true', () => {
    const result = createGradientDef(
      mockColorScheme,
      'test-gradient',
      false,
      undefined,
      true,
    );
    expect(result.colors).toEqual([
      { offset: 0, color: 'blue2' },
      { offset: 100, color: 'blue1' },
    ]);
  });
  it('should combine hover and reverse gradient', () => {
    const result = createGradientDef(
      mockColorScheme,
      'test-gradient',
      true,
      undefined,
      true,
    );
    expect(result.colors).toEqual([
      { offset: 0, color: 'blue4' },
      { offset: 100, color: 'blue3' },
    ]);
  });
  it('should handle angle 0 degrees', () => {
    const result = createGradientDef(
      mockColorScheme,
      'test-gradient',
      false,
      0,
    );
    expect(result.x1).toBe('0%');
    expect(result.y1).toBe('50%');
    expect(result.x2).toBe('100%');
    expect(result.y2).toBe('50%');
  });
  it('should handle angle 180 degrees', () => {
    const result = createGradientDef(
      mockColorScheme,
      'test-gradient',
      false,
      180,
    );
    const y1 = parseFloat(result.y1);
    const y2 = parseFloat(result.y2);
    expect(result.x1).toBe('100%');
    expect(y1).toBeCloseTo(50, 10);
    expect(result.x2).toBe('0%');
    expect(y2).toBeCloseTo(50, 10);
  });
  it('should handle angle 45 degrees', () => {
    const result = createGradientDef(
      mockColorScheme,
      'test-gradient',
      false,
      45,
    );
    const x1Num = parseFloat(result.x1);
    const y1Num = parseFloat(result.y1);
    const x2Num = parseFloat(result.x2);
    const y2Num = parseFloat(result.y2);
    expect(x1Num).toBeCloseTo(14.64, 1);
    expect(y1Num).toBeCloseTo(14.64, 1);
    expect(x2Num).toBeCloseTo(85.36, 1);
    expect(y2Num).toBeCloseTo(85.36, 1);
  });
  it('should handle all parameters together', () => {
    const result = createGradientDef(
      mockColorScheme,
      'complex-gradient',
      true,
      90,
      true,
    );
    const x1 = parseFloat(result.x1);
    const x2 = parseFloat(result.x2);
    expect(result.id).toBe('complex-gradient');
    expect(result.type).toBe('linearGradient');
    expect(x1).toBeCloseTo(50, 10);
    expect(result.y1).toBe('0%');
    expect(x2).toBeCloseTo(50, 10);
    expect(result.y2).toBe('100%');
    expect(result.colors).toEqual([
      { offset: 0, color: 'blue4' },
      { offset: 100, color: 'blue3' },
    ]);
  });
  it('should use default vertical gradient when angle is undefined', () => {
    const result = createGradientDef(mockColorScheme, 'test-gradient');
    expect(result.x1).toBe('0%');
    expect(result.y1).toBe('0%');
    expect(result.x2).toBe('0%');
    expect(result.y2).toBe('100%');
  });
});
