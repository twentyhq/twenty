import { COMMON_CHART_CONSTANTS } from '@/page-layout/widgets/graph/constants/CommonChartConstants';
import { TEXT_MARGIN_LIMITS } from '@/page-layout/widgets/graph/constants/TextMarginLimits';
import {
  getTickRotationConfig,
  type TickRotationConfig,
} from '@/page-layout/widgets/graph/utils/getTickRotationConfig';

describe('getTickRotationConfig', () => {
  const defaultAxisFontSize = COMMON_CHART_CONSTANTS.AXIS_FONT_SIZE;
  const defaultMaxLabelHeight = TEXT_MARGIN_LIMITS.max.bottom;

  describe('when width per tick is large enough for horizontal labels', () => {
    it('should return no rotation when width per tick is large', () => {
      const result: TickRotationConfig = getTickRotationConfig({
        widthPerTick: 200,
        axisFontSize: defaultAxisFontSize,
        maxLabelHeight: defaultMaxLabelHeight,
      });

      expect(result.tickRotation).toBe(
        COMMON_CHART_CONSTANTS.NO_ROTATION_ANGLE,
      );
      expect(result.maxLabelLength).toBeGreaterThan(0);
    });

    it('should calculate maxLabelLength based on widthPerTick and font size', () => {
      const widthPerTick = 100;
      const result: TickRotationConfig = getTickRotationConfig({
        widthPerTick,
        axisFontSize: defaultAxisFontSize,
        maxLabelHeight: defaultMaxLabelHeight,
      });

      const expectedCharacterWidth =
        defaultAxisFontSize *
        COMMON_CHART_CONSTANTS.HORIZONTAL_LABEL_CHARACTER_WIDTH_RATIO;
      const expectedMaxLength = Math.floor(
        widthPerTick / expectedCharacterWidth,
      );

      expect(result.tickRotation).toBe(
        COMMON_CHART_CONSTANTS.NO_ROTATION_ANGLE,
      );
      expect(result.maxLabelLength).toBe(expectedMaxLength);
    });
  });

  describe('when width per tick is too small for horizontal labels', () => {
    it('should return rotated configuration when width is small', () => {
      const result: TickRotationConfig = getTickRotationConfig({
        widthPerTick: 10,
        axisFontSize: defaultAxisFontSize,
        maxLabelHeight: defaultMaxLabelHeight,
      });

      expect(result.tickRotation).toBe(
        COMMON_CHART_CONSTANTS.TICK_ROTATION_ANGLE,
      );
      expect(result.maxLabelLength).toBeGreaterThan(0);
    });

    it('should return at least 1 for maxLabelLength', () => {
      const result: TickRotationConfig = getTickRotationConfig({
        widthPerTick: 1,
        axisFontSize: defaultAxisFontSize,
        maxLabelHeight: defaultMaxLabelHeight,
      });

      expect(result.tickRotation).toBe(
        COMMON_CHART_CONSTANTS.TICK_ROTATION_ANGLE,
      );
      expect(result.maxLabelLength).toBeGreaterThanOrEqual(1);
    });
  });

  describe('edge cases', () => {
    it('should handle zero width per tick', () => {
      const result: TickRotationConfig = getTickRotationConfig({
        widthPerTick: 0,
        axisFontSize: defaultAxisFontSize,
        maxLabelHeight: defaultMaxLabelHeight,
      });

      expect(result.tickRotation).toBe(
        COMMON_CHART_CONSTANTS.TICK_ROTATION_ANGLE,
      );
      expect(result.maxLabelLength).toBeGreaterThanOrEqual(1);
    });

    it('should handle different font sizes', () => {
      const smallFontResult: TickRotationConfig = getTickRotationConfig({
        widthPerTick: 200,
        axisFontSize: 8,
        maxLabelHeight: defaultMaxLabelHeight,
      });

      const largeFontResult: TickRotationConfig = getTickRotationConfig({
        widthPerTick: 200,
        axisFontSize: 16,
        maxLabelHeight: defaultMaxLabelHeight,
      });

      expect(smallFontResult.maxLabelLength).toBeGreaterThan(
        largeFontResult.maxLabelLength,
      );
    });

    it('should allow longer labels when maxLabelHeight increases', () => {
      const baseParams = {
        widthPerTick: 0,
        axisFontSize: defaultAxisFontSize,
      };

      const smallHeightResult: TickRotationConfig = getTickRotationConfig({
        ...baseParams,
        maxLabelHeight: 20,
      });

      const largeHeightResult: TickRotationConfig = getTickRotationConfig({
        ...baseParams,
        maxLabelHeight: 120,
      });

      expect(largeHeightResult.maxLabelLength).toBeGreaterThanOrEqual(
        smallHeightResult.maxLabelLength,
      );
    });
  });
});
