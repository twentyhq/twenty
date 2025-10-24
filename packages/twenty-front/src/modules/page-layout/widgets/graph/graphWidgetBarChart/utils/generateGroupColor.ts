import { RGBA } from 'twenty-ui/theme';

export const generateGroupColor = (
  baseColor: string,
  groupIndex: number,
  totalGroups: number,
): string => {
  if (totalGroups <= 1) {
    return baseColor;
  }

  const alpha = (groupIndex + 1) / totalGroups;

  return RGBA(baseColor, alpha);
};
