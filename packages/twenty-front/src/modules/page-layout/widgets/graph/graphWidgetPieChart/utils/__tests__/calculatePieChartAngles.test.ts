import { calculatePieChartAngles } from '../calculatePieChartAngles';
describe('calculatePieChartAngles', () => {
  it('should calculate angles for a quarter slice (25%)', () => {
    const result = calculatePieChartAngles(25, 0);
    expect(result).toEqual({
      sliceAngle: 90,
      middleAngle: 45,
      newCumulativeAngle: 90,
    });
  });
  it('should calculate angles for a half slice (50%)', () => {
    const result = calculatePieChartAngles(50, 0);
    expect(result).toEqual({
      sliceAngle: 180,
      middleAngle: 90,
      newCumulativeAngle: 180,
    });
  });
  it('should calculate angles for a full circle (100%)', () => {
    const result = calculatePieChartAngles(100, 0);
    expect(result).toEqual({
      sliceAngle: 360,
      middleAngle: 180,
      newCumulativeAngle: 360,
    });
  });
  it('should handle cumulative angles correctly', () => {
    const result = calculatePieChartAngles(25, 90);
    expect(result).toEqual({
      sliceAngle: 90,
      middleAngle: 135,
      newCumulativeAngle: 180,
    });
  });
  it('should handle very small percentages', () => {
    const result = calculatePieChartAngles(1, 0);
    expect(result).toEqual({
      sliceAngle: 3.6,
      middleAngle: 1.8,
      newCumulativeAngle: 3.6,
    });
  });
  it('should handle decimal percentages', () => {
    const result = calculatePieChartAngles(33.33, 0);
    expect(result.sliceAngle).toBeCloseTo(119.988, 2);
    expect(result.middleAngle).toBeCloseTo(59.994, 2);
    expect(result.newCumulativeAngle).toBeCloseTo(119.988, 2);
  });
  it('should handle zero percentage', () => {
    const result = calculatePieChartAngles(0, 45);
    expect(result).toEqual({
      sliceAngle: 0,
      middleAngle: 45,
      newCumulativeAngle: 45,
    });
  });
  it('should calculate sequential slices correctly', () => {
    let cumulative = 0;
    const slice1 = calculatePieChartAngles(30, cumulative);
    expect(slice1.sliceAngle).toBe(108);
    expect(slice1.middleAngle).toBe(54);
    cumulative = slice1.newCumulativeAngle;
    const slice2 = calculatePieChartAngles(50, cumulative);
    expect(slice2.sliceAngle).toBe(180);
    expect(slice2.middleAngle).toBe(198);
    cumulative = slice2.newCumulativeAngle;
    const slice3 = calculatePieChartAngles(20, cumulative);
    expect(slice3.sliceAngle).toBe(72);
    expect(slice3.middleAngle).toBe(324);
    expect(slice3.newCumulativeAngle).toBe(360);
  });
  it('should handle negative percentages as zero', () => {
    const result = calculatePieChartAngles(-10, 0);
    expect(result.sliceAngle).toBeLessThanOrEqual(0);
  });
  it('should handle percentages over 100', () => {
    const result = calculatePieChartAngles(150, 0);
    expect(result).toEqual({
      sliceAngle: 540,
      middleAngle: 270,
      newCumulativeAngle: 540,
    });
  });
});
