// Serializes a JS value into GraphQL literal syntax, for inlining into a query/mutation
// string directly instead of a typed $variable. Used for record data payloads, where the
// per-object generated input type name (e.g. for createOnePerson) isn't known ahead of time.
// `enumKeys` lists top-level object keys whose (possibly array) string value must be emitted
// as a bare enum identifier (SELECT/MULTI_SELECT/RATING) rather than a quoted string.
export const toGraphQlLiteral = (
  value: unknown,
  enumKeys: ReadonlySet<string> = new Set(),
): string => {
  const render = (item: unknown, isEnum: boolean): string => {
    if (item === null || item === undefined) {
      return 'null';
    }
    if (isEnum && typeof item === 'string') {
      return item;
    }
    if (typeof item === 'string') {
      return JSON.stringify(item);
    }
    if (typeof item === 'number' || typeof item === 'boolean') {
      return String(item);
    }
    if (Array.isArray(item)) {
      return `[${item.map((element) => render(element, isEnum)).join(', ')}]`;
    }
    if (typeof item === 'object') {
      const entries = Object.entries(item as Record<string, unknown>)
        .filter(([, subValue]) => subValue !== undefined)
        .map(([key, subValue]) => `${key}: ${render(subValue, enumKeys.has(key))}`);

      return `{${entries.join(', ')}}`;
    }

    throw new Error(`Cannot serialize value of type ${typeof item} to a GraphQL literal`);
  };

  return render(value, false);
};
