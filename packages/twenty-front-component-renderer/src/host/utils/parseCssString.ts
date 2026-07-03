import { isNonEmptyString } from '@sniptt/guards';
import { type CSSProperties } from 'react';

export const parseCssString = (
  styleString: string | undefined,
): CSSProperties | undefined => {
  if (!isNonEmptyString(styleString)) {
    return styleString as CSSProperties | undefined;
  }

  const style: Record<string, string> = {};
  const declarations = styleString.split(';').filter(Boolean);

  for (const declaration of declarations) {
    const colonIndex = declaration.indexOf(':');
    if (colonIndex === -1) {
      continue;
    }

    const property = declaration.slice(0, colonIndex).trim();
    const value = declaration.slice(colonIndex + 1).trim();

    const isCssCustomProperty = property.startsWith('--');

    const key = isCssCustomProperty
      ? property
      : property.replace(/-([a-z])/g, (_, letter: string) =>
          letter.toUpperCase(),
        );

    style[key] = value;
  }

  return style;
};
