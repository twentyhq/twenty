import { interpolateBars } from '@/page-layout/widgets/graph/graphWidgetBarChart/utils/interpolateBars';
import { type BarPosition } from '@/page-layout/widgets/graph/graphWidgetBarChart/types/BarPosition';

describe('interpolateBars', () => {
  const createBar = (overrides: Partial<BarPosition> = {}): BarPosition => ({
    x: 0,
    y: 0,
    width: 50,
    height: 100,
    value: 50,
    indexValue: 'A',
    seriesId: 'value1',
    color: '#ff0000',
    shouldRoundFreeEnd: true,
    seriesIndex: 0,
    ...overrides,
  });

  const toBaselineBar = (bar: BarPosition): BarPosition => ({
    ...bar,
    y: 200,
    height: 0,
    value: 0,
  });

  describe('basic interpolation', () => {
    it('should return target bars when t = 1', () => {
      const sourceBars = [createBar({ x: 0, y: 100, height: 50, value: 25 })];
      const targetBars = [createBar({ x: 0, y: 50, height: 100, value: 50 })];

      const result = interpolateBars(sourceBars, targetBars, 1, toBaselineBar);

      expect(result[0].y).toBe(50);
      expect(result[0].height).toBe(100);
      expect(result[0].value).toBe(50);
    });

    it('should return source bars when t = 0', () => {
      const sourceBars = [createBar({ x: 0, y: 100, height: 50, value: 25 })];
      const targetBars = [createBar({ x: 0, y: 50, height: 100, value: 50 })];

      const result = interpolateBars(sourceBars, targetBars, 0, toBaselineBar);

      expect(result[0].y).toBe(100);
      expect(result[0].height).toBe(50);
      expect(result[0].value).toBe(25);
    });

    it('should interpolate values at t = 0.5', () => {
      const sourceBars = [createBar({ x: 0, y: 100, height: 0, value: 0 })];
      const targetBars = [createBar({ x: 0, y: 0, height: 100, value: 100 })];

      const result = interpolateBars(sourceBars, targetBars, 0.5, toBaselineBar);

      expect(result[0].y).toBeGreaterThan(0);
      expect(result[0].y).toBeLessThan(100);
      expect(result[0].height).toBeGreaterThan(0);
      expect(result[0].height).toBeLessThan(100);
    });
  });

  describe('bar matching', () => {
    it('should match bars by indexValue and seriesId', () => {
      const sourceBars = [
        createBar({ indexValue: 'A', seriesId: 'v1', value: 10 }),
        createBar({ indexValue: 'B', seriesId: 'v1', value: 20 }),
      ];
      const targetBars = [
        createBar({ indexValue: 'B', seriesId: 'v1', value: 40 }),
        createBar({ indexValue: 'A', seriesId: 'v1', value: 30 }),
      ];

      const result = interpolateBars(sourceBars, targetBars, 1, toBaselineBar);

      expect(result).toHaveLength(2);
      const barA = result.find((b) => b.indexValue === 'A');
      const barB = result.find((b) => b.indexValue === 'B');
      expect(barA?.value).toBe(30);
      expect(barB?.value).toBe(40);
    });
  });

  describe('entering bars (new bars in target)', () => {
    it('should animate new bars from baseline', () => {
      const sourceBars: BarPosition[] = [];
      const targetBars = [createBar({ y: 50, height: 100, value: 50 })];

      const result = interpolateBars(
        sourceBars,
        targetBars,
        0.5,
        toBaselineBar,
      );

      expect(result).toHaveLength(1);
      expect(result[0].height).toBeGreaterThan(0);
      expect(result[0].height).toBeLessThan(100);
    });
  });

  describe('exiting bars (bars removed from target)', () => {
    it('should animate removed bars to baseline', () => {
      const sourceBars = [createBar({ y: 50, height: 100, value: 50 })];
      const targetBars: BarPosition[] = [];

      const result = interpolateBars(
        sourceBars,
        targetBars,
        0.5,
        toBaselineBar,
      );

      expect(result).toHaveLength(1);
      expect(result[0].height).toBeGreaterThan(0);
      expect(result[0].height).toBeLessThan(100);
    });
  });

  describe('property preservation', () => {
    it('should preserve target color', () => {
      const sourceBars = [createBar({ color: '#ff0000' })];
      const targetBars = [createBar({ color: '#00ff00' })];

      const result = interpolateBars(sourceBars, targetBars, 0.5, toBaselineBar);

      expect(result[0].color).toBe('#00ff00');
    });

    it('should handle bars with different seriesIds as different bars', () => {
      const sourceBars = [createBar({ indexValue: 'A', seriesId: 'old' })];
      const targetBars = [createBar({ indexValue: 'A', seriesId: 'new' })];

      const result = interpolateBars(sourceBars, targetBars, 0.5, toBaselineBar);

      // Different seriesId = different bar identity, so both are interpolated
      expect(result).toHaveLength(2);
      expect(result.map((b) => b.seriesId).sort()).toEqual(['new', 'old']);
    });

    it('should handle bars with different indexValues as different bars', () => {
      const sourceBars = [createBar({ indexValue: 'old', seriesId: 'v1' })];
      const targetBars = [createBar({ indexValue: 'new', seriesId: 'v1' })];

      const result = interpolateBars(sourceBars, targetBars, 0.5, toBaselineBar);

      // Different indexValue = different bar identity, so both are interpolated
      expect(result).toHaveLength(2);
      expect(result.map((b) => b.indexValue).sort()).toEqual(['new', 'old']);
    });
  });

  describe('multiple bars interpolation', () => {
    it('should interpolate all bars independently', () => {
      const sourceBars = [
        createBar({ indexValue: 'A', seriesId: 'v1', height: 50 }),
        createBar({ indexValue: 'A', seriesId: 'v2', height: 30 }),
        createBar({ indexValue: 'B', seriesId: 'v1', height: 70 }),
      ];
      const targetBars = [
        createBar({ indexValue: 'A', seriesId: 'v1', height: 100 }),
        createBar({ indexValue: 'A', seriesId: 'v2', height: 60 }),
        createBar({ indexValue: 'B', seriesId: 'v1', height: 140 }),
      ];

      const result = interpolateBars(sourceBars, targetBars, 1, toBaselineBar);

      expect(result).toHaveLength(3);
    });
  });

  describe('easing', () => {
    it('should apply easing to interpolation', () => {
      const sourceBars = [createBar({ height: 0, value: 0 })];
      const targetBars = [createBar({ height: 100, value: 100 })];

      const linearMidpoint = 50;
      const result = interpolateBars(
        sourceBars,
        targetBars,
        0.5,
        toBaselineBar,
      );

      expect(result[0].height).not.toBe(linearMidpoint);
    });
  });

  describe('edge cases', () => {
    it('should handle empty source and target arrays', () => {
      const result = interpolateBars([], [], 0.5, toBaselineBar);

      expect(result).toEqual([]);
    });

    it('should skip bars with no match when both are undefined', () => {
      const result = interpolateBars([], [], 0.5, toBaselineBar);

      expect(result).toHaveLength(0);
    });
  });
});
