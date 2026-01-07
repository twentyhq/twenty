import { COMMON_CHART_CONSTANTS } from '@/page-layout/widgets/graph/constants/CommonChartConstants';
import { computeMaxLabelLengthForMargin } from '@/page-layout/widgets/graph/utils/computeMaxLabelLengthForMargin';

describe('computeMaxLabelLengthForMargin', () => {
  it('should calculate label length based on margin size and font size', () => {
    const result = computeMaxLabelLengthForMargin({
      marginSize: 100,
      axisFontSize: 11,
    });

    const expectedCharacterWidth =
      11 * COMMON_CHART_CONSTANTS.HORIZONTAL_LABEL_CHARACTER_WIDTH_RATIO;
    const availableWidth = 100 - COMMON_CHART_CONSTANTS.TICK_PADDING_ALLOWANCE;
    const expectedLength = Math.floor(availableWidth / expectedCharacterWidth);

    expect(result).toBe(expectedLength);
  });

  it('should return minimum length when margin is too small', () => {
    const result = computeMaxLabelLengthForMargin({
      marginSize: 20,
      axisFontSize: 11,
    });

    const minimumLength =
      COMMON_CHART_CONSTANTS.TICK_MINIMUM_NUMBER_OF_DISPLAYED_CHARACTERS;

    expect(result).toBe(minimumLength);
  });

  it('should scale with font size', () => {
    const smallFont = computeMaxLabelLengthForMargin({
      marginSize: 100,
      axisFontSize: 10,
    });

    const largeFont = computeMaxLabelLengthForMargin({
      marginSize: 100,
      axisFontSize: 14,
    });

    expect(smallFont).toBeGreaterThan(largeFont);
  });

  it('should scale with margin size', () => {
    const smallMargin = computeMaxLabelLengthForMargin({
      marginSize: 50,
      axisFontSize: 11,
    });

    const largeMargin = computeMaxLabelLengthForMargin({
      marginSize: 150,
      axisFontSize: 11,
    });

    expect(largeMargin).toBeGreaterThan(smallMargin);
  });

  it('should never return less than the minimum displayable characters', () => {
    const result = computeMaxLabelLengthForMargin({
      marginSize: 0,
      axisFontSize: 11,
    });

    const minimumLength =
      COMMON_CHART_CONSTANTS.TICK_MINIMUM_NUMBER_OF_DISPLAYED_CHARACTERS;

    expect(result).toBeGreaterThanOrEqual(minimumLength);
  });
});
