const NAME_BOUNDARY_REGEX = /(^|[\s'-])(\p{L})/gu;

export const capitalizeName = (value: string): string =>
  value.replace(
    NAME_BOUNDARY_REGEX,
    (_match, boundary: string, letter: string) =>
      `${boundary}${letter.toUpperCase()}`,
  );
