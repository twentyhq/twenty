import { type BarPosition } from '@/page-layout/widgets/graph/graphWidgetBarChart/types/BarPosition';
import { computeBaselineBar } from '@/page-layout/widgets/graph/graphWidgetBarChart/utils/computeBaselineBar';

describe('computeBaselineBar', () => {
  const createBar = (overrides: Partial<BarPosition> = {}): BarPosition => ({
    x: 50,
    y: 100,
    width: 40,
    height: 80,
    value: 50,
    indexValue: 'A',
    seriesId: 'value1',
    color: 'red',
    shouldRoundFreeEnd: true,
    seriesIndex: 0,
    ...overrides,
  });

  describe('vertical layout', () => {
    it('should set y to baseline and height to 0', () => {
      const bar = createBar({ y: 50, height: 100, value: 75 });

      const result = computeBaselineBar({
        bar,
        innerHeight: 200,
        zeroPixel: 100,
        isVertical: true,
      });

      expect(result.y).toBe(100);
      expect(result.height).toBe(0);
      expect(result.value).toBe(0);
    });

    it('should preserve x and width', () => {
      const bar = createBar({ x: 75, width: 50 });

      const result = computeBaselineBar({
        bar,
        innerHeight: 200,
        zeroPixel: 100,
        isVertical: true,
      });

      expect(result.x).toBe(75);
      expect(result.width).toBe(50);
    });

    it('should preserve other properties', () => {
      const bar = createBar({
        indexValue: 'B',
        seriesId: 'value2',
        color: 'green',
        shouldRoundFreeEnd: false,
        seriesIndex: 2,
      });

      const result = computeBaselineBar({
        bar,
        innerHeight: 200,
        zeroPixel: 100,
        isVertical: true,
      });

      expect(result.indexValue).toBe('B');
      expect(result.seriesId).toBe('value2');
      expect(result.color).toBe('green');
      expect(result.shouldRoundFreeEnd).toBe(false);
      expect(result.seriesIndex).toBe(2);
    });
  });

  describe('horizontal layout', () => {
    it('should set x to zeroPixel and width to 0', () => {
      const bar = createBar({ x: 50, width: 100, value: 75 });

      const result = computeBaselineBar({
        bar,
        innerHeight: 200,
        zeroPixel: 80,
        isVertical: false,
      });

      expect(result.x).toBe(80);
      expect(result.width).toBe(0);
      expect(result.value).toBe(0);
    });

    it('should preserve y and height', () => {
      const bar = createBar({ y: 60, height: 40 });

      const result = computeBaselineBar({
        bar,
        innerHeight: 200,
        zeroPixel: 80,
        isVertical: false,
      });

      expect(result.y).toBe(60);
      expect(result.height).toBe(40);
    });
  });

  describe('edge cases', () => {
    it('should handle zeroPixel at 0', () => {
      const bar = createBar();

      const result = computeBaselineBar({
        bar,
        innerHeight: 200,
        zeroPixel: 0,
        isVertical: true,
      });

      expect(result.y).toBe(200);
      expect(result.height).toBe(0);
    });

    it('should handle zeroPixel equal to innerHeight', () => {
      const bar = createBar();

      const result = computeBaselineBar({
        bar,
        innerHeight: 200,
        zeroPixel: 200,
        isVertical: true,
      });

      expect(result.y).toBe(0);
      expect(result.height).toBe(0);
    });
  });
});
