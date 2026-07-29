import { type CSSProperties } from 'react';

// Converts the inline CSS string carried by email block node attributes
// (e.g. "background-color: #fff; padding: 12px") into a React style object.
// Pattern borrowed from @react-email/editor (MIT).
export const inlineCssToJs = (css: string | undefined | null): CSSProperties => {
  if (typeof css !== 'string' || css.trim() === '') {
    return {};
  }

  return css
    .split(';')
    .map((declaration) => declaration.trim())
    .filter((declaration) => declaration !== '')
    .reduce<Record<string, string>>((styles, declaration) => {
      const colonIndex = declaration.indexOf(':');
      if (colonIndex === -1) {
        return styles;
      }

      const property = declaration.slice(0, colonIndex).trim();
      const value = declaration.slice(colonIndex + 1).trim();
      if (property === '' || value === '') {
        return styles;
      }

      const camelCasedProperty = property.replace(
        /-([a-z])/g,
        (_match, letter: string) => letter.toUpperCase(),
      );

      styles[camelCasedProperty] = value;
      return styles;
    }, {}) as CSSProperties;
};
