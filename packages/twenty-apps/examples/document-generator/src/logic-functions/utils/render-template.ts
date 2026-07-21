// Flattens a nested record into dot-path keys, e.g.
// { name: { firstName: 'Ada' } } -> { 'name.firstName': 'Ada' }.
// Only string/number/boolean leaves are kept; nullish values become ''.
export const flattenRecord = (
  input: Record<string, unknown>,
  prefix = '',
): Record<string, string> => {
  return Object.entries(input).reduce<Record<string, string>>(
    (accumulator, [key, value]) => {
      const path = prefix ? `${prefix}.${key}` : key;

      if (value === null || value === undefined) {
        accumulator[path] = '';
      } else if (typeof value === 'object' && !Array.isArray(value)) {
        Object.assign(
          accumulator,
          flattenRecord(value as Record<string, unknown>, path),
        );
      } else if (typeof value !== 'object') {
        accumulator[path] = String(value);
      }

      return accumulator;
    },
    {},
  );
};

const PLACEHOLDER_PATTERN = /\{\{\s*([\w.]+)\s*\}\}/g;

export type RenderResult = {
  content: string;
  missingTokens: string[];
};

// Replaces every {{token}} in the template body with the matching value from
// the flattened record. Unknown tokens are rendered empty and reported so the
// caller can warn the user about placeholders that did not resolve.
export const renderTemplate = (
  body: string,
  values: Record<string, string>,
): RenderResult => {
  const missingTokens = new Set<string>();

  const content = body.replace(PLACEHOLDER_PATTERN, (_match, token: string) => {
    const value = values[token];

    if (value === undefined || value === '') {
      missingTokens.add(token);

      return '';
    }

    return value;
  });

  return { content, missingTokens: [...missingTokens] };
};
