import { calculateGaugeChartEndLineCoordinates } from '@/page-layout/widgets/graph/graphWidgetGaugeChart/utils/calculateGaugeChartEndLineCoordinates';

describe('calculateGaugeChartEndLineCoordinates', () => {
  it('should calculate coordinates for angle π/2 (after adjustment points right)', () => {
    const result = calculateGaugeChartEndLineCoordinates(
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

  it('should calculate coordinates for angle π (after adjustment points down)', () => {
    const result = calculateGaugeChartEndLineCoordinates(
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

  it('should calculate coordinates for angle 3π/2 (after adjustment points left)', () => {
    const result = calculateGaugeChartEndLineCoordinates(
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

  it('should calculate coordinates for angle 0 (after adjustment points up)', () => {
    const result = calculateGaugeChartEndLineCoordinates(0, 100, 100, 50, 80);
    expect(result.x1).toBeCloseTo(100, 5);
    expect(result.y1).toBeCloseTo(50, 5);
    expect(result.x2).toBeCloseTo(100, 5);
    expect(result.y2).toBeCloseTo(20, 5);
  });

  it('should calculate coordinates for 45-degree angle', () => {
    const angle = Math.PI / 4;
    const result = calculateGaugeChartEndLineCoordinates(
      angle,
      100,
      100,
      50,
      80,
    );
    const adjustedAngle = angle - Math.PI / 2;
    const expectedCos = Math.cos(adjustedAngle);
    const expectedSin = Math.sin(adjustedAngle);
    expect(result.x1).toBeCloseTo(100 + expectedCos * 50, 5);
    expect(result.y1).toBeCloseTo(100 + expectedSin * 50, 5);
    expect(result.x2).toBeCloseTo(100 + expectedCos * 80, 5);
    expect(result.y2).toBeCloseTo(100 + expectedSin * 80, 5);
  });

  it('should handle different center positions', () => {
    const result = calculateGaugeChartEndLineCoordinates(
      Math.PI,
      200,
      150,
      30,
      60,
    );
    expect(result).toEqual({
      x1: 200,
      y1: 180,
      x2: 200,
      y2: 210,
    });
  });

  it('should handle zero radius', () => {
    const result = calculateGaugeChartEndLineCoordinates(
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
    const result = calculateGaugeChartEndLineCoordinates(
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
    const result = calculateGaugeChartEndLineCoordinates(
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

  it('should handle angles greater than 2π', () => {
    const result = calculateGaugeChartEndLineCoordinates(
      2.5 * Math.PI,
      100,
      100,
      50,
      80,
    );
    const equivalentResult = calculateGaugeChartEndLineCoordinates(
      0.5 * Math.PI,
      100,
      100,
      50,
      80,
    );
    expect(result.x1).toBeCloseTo(equivalentResult.x1, 10);
    expect(result.y1).toBeCloseTo(equivalentResult.y1, 10);
    expect(result.x2).toBeCloseTo(equivalentResult.x2, 10);
    expect(result.y2).toBeCloseTo(equivalentResult.y2, 10);
  });
});
