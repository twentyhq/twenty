import { calculatePieChartEndLineCoordinates } from '../calculatePieChartEndLineCoordinates';
describe('calculatePieChartEndLineCoordinates', () => {
  it('should calculate coordinates for angle 0 (top)', () => {
    const result = calculatePieChartEndLineCoordinates(0, 100, 100, 50, 80);
    expect(result).toEqual({
      x1: 100,
      y1: 50,
      x2: 100,
      y2: 20,
    });
  });
  it('should calculate coordinates for angle π/2 (right)', () => {
    const result = calculatePieChartEndLineCoordinates(
      Math.PI / 2,
      100,
      100,
      50,
      80,
    );
    expect(result).toEqual({
      x1: 150,
      y1: 100,
      x2: 180,
      y2: 100,
    });
  });
  it('should calculate coordinates for angle π (bottom)', () => {
    const result = calculatePieChartEndLineCoordinates(
      Math.PI,
      100,
      100,
      50,
      80,
    );
    expect(result).toEqual({
      x1: 100,
      y1: 150,
      x2: 100,
      y2: 180,
    });
  });
  it('should calculate coordinates for angle 3π/2 (left)', () => {
    const result = calculatePieChartEndLineCoordinates(
      (3 * Math.PI) / 2,
      100,
      100,
      50,
      80,
    );
    expect(result.x1).toBeCloseTo(50, 5);
    expect(result.y1).toBeCloseTo(100, 5);
    expect(result.x2).toBeCloseTo(20, 5);
    expect(result.y2).toBeCloseTo(100, 5);
  });
  it('should calculate coordinates for 45-degree angle', () => {
    const angle = Math.PI / 4;
    const result = calculatePieChartEndLineCoordinates(angle, 100, 100, 50, 80);
    const expectedCos = Math.sqrt(2) / 2;
    const expectedSin = -Math.sqrt(2) / 2;
    expect(result.x1).toBeCloseTo(100 + expectedCos * 50, 5);
    expect(result.y1).toBeCloseTo(100 + expectedSin * 50, 5);
    expect(result.x2).toBeCloseTo(100 + expectedCos * 80, 5);
    expect(result.y2).toBeCloseTo(100 + expectedSin * 80, 5);
  });
  it('should handle different center positions', () => {
    const result = calculatePieChartEndLineCoordinates(
      Math.PI / 2,
      200,
      150,
      30,
      60,
    );
    expect(result).toEqual({
      x1: 230,
      y1: 150,
      x2: 260,
      y2: 150,
    });
  });
  it('should handle zero radius', () => {
    const result = calculatePieChartEndLineCoordinates(
      Math.PI / 4,
      100,
      100,
      0,
      0,
    );
    expect(result).toEqual({
      x1: 100,
      y1: 100,
      x2: 100,
      y2: 100,
    });
  });
  it('should handle negative angles', () => {
    const result = calculatePieChartEndLineCoordinates(
      -Math.PI / 2,
      100,
      100,
      50,
      80,
    );
    expect(result.x1).toBeCloseTo(50, 5);
    expect(result.y1).toBeCloseTo(100, 5);
    expect(result.x2).toBeCloseTo(20, 5);
    expect(result.y2).toBeCloseTo(100, 5);
  });
  it('should create a line from inner to outer radius', () => {
    const angle = Math.PI / 6;
    const centerX = 100;
    const centerY = 100;
    const innerRadius = 40;
    const outerRadius = 70;
    const result = calculatePieChartEndLineCoordinates(
      angle,
      centerX,
      centerY,
      innerRadius,
      outerRadius,
    );
    const dist1 = Math.sqrt(
      (result.x1 - centerX) ** 2 + (result.y1 - centerY) ** 2,
    );
    const dist2 = Math.sqrt(
      (result.x2 - centerX) ** 2 + (result.y2 - centerY) ** 2,
    );
    expect(dist1).toBeCloseTo(innerRadius, 5);
    expect(dist2).toBeCloseTo(outerRadius, 5);
    const angle1 = Math.atan2(result.y1 - centerY, result.x1 - centerX);
    const angle2 = Math.atan2(result.y2 - centerY, result.x2 - centerX);
    expect(angle1).toBeCloseTo(angle2, 5);
  });
});
