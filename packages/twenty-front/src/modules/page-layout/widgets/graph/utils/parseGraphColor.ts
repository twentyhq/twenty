import { type GraphColor } from '@/page-layout/widgets/graph/types/GraphColor';
import { isDefined } from 'twenty-shared/utils';
import { MAIN_COLOR_NAMES, type ThemeColor } from 'twenty-ui/theme';

export const parseGraphColor = (
  value: string | null | undefined,
): GraphColor | undefined => {
  if (!isDefined(value)) {
    return undefined;
  }

  if (value === 'auto') {
    return 'auto';
  }

  if (MAIN_COLOR_NAMES.includes(value as ThemeColor)) {
    return value as GraphColor;
  }

  return undefined;
};
