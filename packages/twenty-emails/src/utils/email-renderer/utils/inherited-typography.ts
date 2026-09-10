import { type CSSProperties } from 'react';

const INHERITED_TYPOGRAPHY_PROPERTIES = [
  'color',
  'fontSize',
  'lineHeight',
  'letterSpacing',
  'textAlign',
  'fontFamily',
  'fontWeight',
] as const satisfies readonly (keyof CSSProperties)[];

export type InheritedTypography = Pick<
  CSSProperties,
  (typeof INHERITED_TYPOGRAPHY_PROPERTIES)[number]
>;

export const pickInheritedTypography = (
  style: CSSProperties,
): InheritedTypography =>
  INHERITED_TYPOGRAPHY_PROPERTIES.reduce<InheritedTypography>(
    (typography, property) =>
      style[property] === undefined
        ? typography
        : { ...typography, [property]: style[property] },
    {},
  );

export const mergeInheritedTypography = (
  inherited: InheritedTypography,
  style: CSSProperties,
): InheritedTypography => ({
  ...inherited,
  ...pickInheritedTypography(style),
});
