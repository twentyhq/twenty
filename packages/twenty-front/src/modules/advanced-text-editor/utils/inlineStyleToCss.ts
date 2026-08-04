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
