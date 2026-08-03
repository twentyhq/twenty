// Serializes a structured style object ({ backgroundColor: '#fff' }) into
// the style attribute string the canvas DOM needs. One-way by design: the
// object is the source of truth and round-trips through data-style as JSON,
// so nothing ever parses CSS text back.
export const inlineStyleToCss = (style: unknown): string => {
  if (typeof style !== 'object' || style === null) {
    return '';
  }

  return Object.entries(style)
    .filter((entry): entry is [string, string] => typeof entry[1] === 'string')
    .map(
      ([property, value]) =>
        `${property.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`)}: ${value};`,
    )
    .join(' ');
};
