export const serializeInlineStyle = (styles: Record<string, string>): string =>
  Object.entries(styles)
    .map(([property, value]) => `${property}: ${value};`)
    .join(' ');
