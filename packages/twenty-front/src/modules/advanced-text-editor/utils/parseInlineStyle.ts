// Parses an inline CSS string ("background-color: #fff; padding: 12px") into
// a property map. Counterpart of serializeInlineStyle.
export const parseInlineStyle = (
  style: string | undefined | null,
): Record<string, string> => {
  if (typeof style !== 'string' || style.trim() === '') {
    return {};
  }

  return style
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

      styles[property] = value;
      return styles;
    }, {});
};
