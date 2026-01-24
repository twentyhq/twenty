import { COMMON_CHART_CONSTANTS } from '@/page-layout/widgets/graph/constants/CommonChartConstants';
import { isNumber, isString } from '@sniptt/guards';

const getRootFontSize = () => {
  if (typeof document === 'undefined') {
    return COMMON_CHART_CONSTANTS.AXIS_FONT_SIZE;
  }

  const rootFontSize = getComputedStyle(document.documentElement).fontSize;
  const parsed = Number.parseFloat(rootFontSize);

  return Number.isFinite(parsed) && parsed > 0
    ? parsed
    : COMMON_CHART_CONSTANTS.AXIS_FONT_SIZE;
};

export const parseFontSizeToPx = (
  fontSize: number | string | undefined,
  fallback: number,
) => {
  if (isNumber(fontSize)) {
    return Number.isFinite(fontSize) && fontSize > 0 ? fontSize : fallback;
  }

  if (isString(fontSize)) {
    const trimmed = fontSize.trim();
    const parsed = Number.parseFloat(trimmed);

    if (!Number.isFinite(parsed) || parsed <= 0) {
      return fallback;
    }

    if (trimmed.endsWith('rem') || trimmed.endsWith('em')) {
      return parsed * getRootFontSize();
    }

    return parsed;
  }

  return fallback;
};
