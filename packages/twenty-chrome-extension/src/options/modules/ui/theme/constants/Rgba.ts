/* eslint-disable @nx/workspace-no-hardcoded-colors */
import hexRgb from 'hex-rgb';

export const RGBA = (hex: string, alpha: number) => {
  return `rgba(${hexRgb(hex, { format: 'array' })
    .slice(0, -1)
    .join(',')},${alpha})`;
};
