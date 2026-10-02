export const stripNulCharacters = <T>(value: T): T =>
  JSON.parse(JSON.stringify(value), (_key, nestedValue) =>
    typeof nestedValue === 'string'
      ? nestedValue.replaceAll('\u0000', '')
      : nestedValue,
  );
