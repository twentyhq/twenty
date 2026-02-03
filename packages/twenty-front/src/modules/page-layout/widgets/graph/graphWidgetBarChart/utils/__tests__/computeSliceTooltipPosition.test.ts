import { type BarChartSlice } from '@/page-layout/widgets/graph/graphWidgetBarChart/types/BarChartSlice';
import { computeSliceTooltipPosition } from '@/page-layout/widgets/graph/graphWidgetBarChart/utils/computeSliceTooltipPosition';

describe('computeSliceTooltipPosition', () => {
  const defaultMargins = { top: 20, right: 20, bottom: 40, left: 60 };

  const createSlice = (
    overrides: Partial<BarChartSlice> = {},
  ): BarChartSlice => ({
    indexValue: 'A',
    bars: [],
    sliceLeft: 50,
    sliceRight: 100,
    sliceCenter: 75,
    ...overrides,
  });

  const createBar = (x: number, y: number, width: number, height: number) => ({
    x,
    y,
    width,
    height,
    value: 50,
    indexValue: 'A',
    seriesId: 'value1',
    color: 'red',
    shouldRoundFreeEnd: true,
    seriesIndex: 0,
  });

  describe('vertical layout with bars', () => {
    it('should position tooltip at slice center and top of anchor bar', () => {
      const slice = createSlice({
        bars: [createBar(50, 100, 40, 60)],
        sliceCenter: 75,
      });

      const result = computeSliceTooltipPosition({
        slice,
        margins: defaultMargins,
        innerHeight: 200,
        isVertical: true,
      });

      expect(result.offsetLeft).toBe(75 + defaultMargins.left);
      expect(result.offsetTop).toBe(100 + defaultMargins.top);
    });

    it('should use the topmost bar as anchor when multiple bars exist', () => {
      const slice = createSlice({
        bars: [createBar(50, 150, 40, 30), createBar(95, 80, 40, 100)],
        sliceCenter: 75,
      });

      const result = computeSliceTooltipPosition({
        slice,
        margins: defaultMargins,
        innerHeight: 200,
        isVertical: true,
      });

      expect(result.offsetTop).toBe(80 + defaultMargins.top);
    });
  });

  describe('horizontal layout with bars', () => {
    it('should position tooltip at end of anchor bar and slice center', () => {
      const slice = createSlice({
        bars: [createBar(0, 50, 100, 40)],
        sliceCenter: 70,
      });

      const result = computeSliceTooltipPosition({
        slice,
        margins: defaultMargins,
        innerHeight: 200,
        isVertical: false,
      });

      expect(result.offsetLeft).toBe(0 + 100 + defaultMargins.left);
      expect(result.offsetTop).toBe(70 + defaultMargins.top);
    });

    it('should use the rightmost bar as anchor when multiple bars exist', () => {
      const slice = createSlice({
        bars: [createBar(0, 50, 80, 40), createBar(0, 95, 120, 40)],
        sliceCenter: 70,
      });

      const result = computeSliceTooltipPosition({
        slice,
        margins: defaultMargins,
        innerHeight: 200,
        isVertical: false,
      });

      expect(result.offsetLeft).toBe(0 + 120 + defaultMargins.left);
    });
  });

  describe('vertical layout without bars', () => {
    it('should position tooltip at slice center and bottom of chart', () => {
      const slice = createSlice({
        bars: [],
        sliceCenter: 75,
      });

      const result = computeSliceTooltipPosition({
        slice,
        margins: defaultMargins,
        innerHeight: 200,
        isVertical: true,
      });

      expect(result.offsetLeft).toBe(75 + defaultMargins.left);
      expect(result.offsetTop).toBe(200 + defaultMargins.top);
    });
  });

  describe('horizontal layout without bars', () => {
    it('should position tooltip at left edge and slice center', () => {
      const slice = createSlice({
        bars: [],
        sliceCenter: 70,
      });

      const result = computeSliceTooltipPosition({
        slice,
        margins: defaultMargins,
        innerHeight: 200,
        isVertical: false,
      });

      expect(result.offsetLeft).toBe(defaultMargins.left);
      expect(result.offsetTop).toBe(70 + defaultMargins.top);
    });
  });
});
