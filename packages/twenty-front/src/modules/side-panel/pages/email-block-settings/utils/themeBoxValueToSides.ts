import { type CssBoxSides } from '@/side-panel/pages/email-block-settings/components/EmailBoxSidesInput';

export const themeBoxValueToSides = (value: string): CssBoxSides => {
  const tokens = value.trim().split(/\s+/);

  if (tokens.length === 4) {
    return {
      top: tokens[0],
      right: tokens[1],
      bottom: tokens[2],
      left: tokens[3],
    };
  }

  if (tokens.length === 3) {
    return {
      top: tokens[0],
      right: tokens[1],
      bottom: tokens[2],
      left: tokens[1],
    };
  }

  if (tokens.length === 2) {
    return {
      top: tokens[0],
      right: tokens[1],
      bottom: tokens[0],
      left: tokens[1],
    };
  }

  return { top: value, right: value, bottom: value, left: value };
};
