const NAMED_ENTITIES: Record<string, string> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: ' ',
};

export const decodeHtmlEntities = (value: string): string =>
  value
    .replace(/&#(\d+);/g, (_match, code: string) =>
      String.fromCodePoint(Number(code)),
    )
    .replace(/&#x([0-9a-fA-F]+);/g, (_match, code: string) =>
      String.fromCodePoint(Number.parseInt(code, 16)),
    )
    .replace(
      /&([a-zA-Z]+);/g,
      (match, name: string) => NAMED_ENTITIES[name.toLowerCase()] ?? match,
    );
