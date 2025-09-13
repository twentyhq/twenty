import { calculateAngularGradient } from '../calculateAngularGradient';
describe('calculateAngularGradient', () => {
  it('should calculate gradient for 0 degrees', () => {
    const result = calculateAngularGradient(0);
    expect(result).toEqual({
      x1: '0%',
      y1: '50%',
      x2: '100%',
      y2: '50%',
    });
  });
  it('should calculate gradient for 90 degrees', () => {
    const result = calculateAngularGradient(90);
    const x1 = parseFloat(result.x1);
    const x2 = parseFloat(result.x2);
    expect(x1).toBeCloseTo(50, 10);
    expect(result.y1).toBe('0%');
    expect(x2).toBeCloseTo(50, 10);
    expect(result.y2).toBe('100%');
  });
  it('should calculate gradient for 180 degrees', () => {
    const result = calculateAngularGradient(180);
    const y1 = parseFloat(result.y1);
    const y2 = parseFloat(result.y2);
    expect(result.x1).toBe('100%');
    expect(y1).toBeCloseTo(50, 10);
    expect(result.x2).toBe('0%');
    expect(y2).toBeCloseTo(50, 10);
  });
  it('should calculate gradient for 270 degrees', () => {
    const result = calculateAngularGradient(270);
    const x1 = parseFloat(result.x1);
    const x2 = parseFloat(result.x2);
    expect(x1).toBeCloseTo(50, 10);
    expect(result.y1).toBe('100%');
    expect(x2).toBeCloseTo(50, 10);
    expect(result.y2).toBe('0%');
  });
  it('should calculate gradient for 45 degrees (diagonal)', () => {
    const result = calculateAngularGradient(45);
    const { x1, y1, x2, y2 } = result;
    const x1Num = parseFloat(x1);
    const y1Num = parseFloat(y1);
    const x2Num = parseFloat(x2);
    const y2Num = parseFloat(y2);
    expect(x1Num).toBeCloseTo(14.64, 1);
    expect(y1Num).toBeCloseTo(14.64, 1);
    expect(x2Num).toBeCloseTo(85.36, 1);
    expect(y2Num).toBeCloseTo(85.36, 1);
  });
  it('should handle negative angles', () => {
    const result = calculateAngularGradient(-90);
    expect(result).toEqual({
      x1: '50%',
      y1: '100%',
      x2: '50%',
      y2: '0%',
    });
  });
  it('should handle angles greater than 360', () => {
    const result = calculateAngularGradient(450);
    const x1 = parseFloat(result.x1);
    const x2 = parseFloat(result.x2);
    expect(x1).toBeCloseTo(50, 10);
    expect(result.y1).toBe('0%');
    expect(x2).toBeCloseTo(50, 10);
    expect(result.y2).toBe('100%');
  });
  it('should calculate gradient for 135 degrees', () => {
    const result = calculateAngularGradient(135);
    const { x1, y1, x2, y2 } = result;
    const x1Num = parseFloat(x1);
    const y1Num = parseFloat(y1);
    const x2Num = parseFloat(x2);
    const y2Num = parseFloat(y2);
    expect(x1Num).toBeCloseTo(85.36, 1);
    expect(y1Num).toBeCloseTo(14.64, 1);
    expect(x2Num).toBeCloseTo(14.64, 1);
    expect(y2Num).toBeCloseTo(85.36, 1);
  });
  it('should maintain gradient line through center', () => {
    const angles = [30, 60, 120, 150, 210, 240, 300, 330];
    angles.forEach((angle) => {
      const result = calculateAngularGradient(angle);
      const x1Num = parseFloat(result.x1);
      const y1Num = parseFloat(result.y1);
      const x2Num = parseFloat(result.x2);
      const y2Num = parseFloat(result.y2);
      const dist1 = Math.sqrt((x1Num - 50) ** 2 + (y1Num - 50) ** 2);
      const dist2 = Math.sqrt((x2Num - 50) ** 2 + (y2Num - 50) ** 2);
      expect(Math.abs(dist1 - dist2)).toBeLessThan(0.01);
    });
  });
});
