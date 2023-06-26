import { grayScale, rgba } from './colors';

export const boxShadowLight = {
  light: `0px 2px 4px 0px ${rgba(
    grayScale.gray100,
    0.04,
  )}, 0px 0px 4px 0px ${rgba(grayScale.gray100, 0.08)}`,
  strong: `2px 4px 16px 0px ${rgba(
    grayScale.gray100,
    0.12,
  )}, 0px 2px 4px 0px ${rgba(grayScale.gray100, 0.04)}`,
};

export const boxShadowDark = {
  light: `0px 2px 4px 0px ${rgba(
    grayScale.gray100,
    0.04,
  )}, 0px 0px 4px 0px ${rgba(grayScale.gray100, 0.08)}`,
  strong: `2px 4px 16px 0px ${rgba(
    grayScale.gray100,
    0.16,
  )}, 0px 2px 4px 0px ${rgba(grayScale.gray100, 0.08)}`,
};
