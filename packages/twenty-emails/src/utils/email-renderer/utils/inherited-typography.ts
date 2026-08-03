import { type CSSProperties } from 'react';

// Typography a section imposes on everything inside it. These cascade in a
// browser, but react-email's Text writes fontSize and lineHeight onto every
// paragraph, and Outlook's Word engine ignores `inherit`, so the cascade is
// resolved here and written out explicitly on each text node instead.
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
  INHERITED_TYPOGRAPHY_PROPERTIES.reduce<Record<string, unknown>>(
    (typography, property) => {
      if (style[property] !== undefined) {
        typography[property] = style[property];
      }

      return typography;
    },
    {},
  );

// A nested section refines what it inherits rather than replacing it.
export const mergeInheritedTypography = (
  inherited: InheritedTypography,
  style: CSSProperties,
): InheritedTypography => ({
  ...inherited,
  ...pickInheritedTypography(style),
});
