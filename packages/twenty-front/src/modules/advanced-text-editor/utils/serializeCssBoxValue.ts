import { type CssBoxSides } from '@/advanced-text-editor/utils/parseCssBoxValue';

// Collapses four sides back into the shortest CSS shorthand.
export const serializeCssBoxValue = ({
  top,
  right,
  bottom,
  left,
}: CssBoxSides): string => {
  if (top === right && right === bottom && bottom === left) {
    return top;
  }

  if (top === bottom && right === left) {
    return `${top} ${right}`;
  }

  return `${top} ${right} ${bottom} ${left}`;
};
