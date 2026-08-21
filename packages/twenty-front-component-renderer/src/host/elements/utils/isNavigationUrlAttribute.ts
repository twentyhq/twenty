const NAVIGATION_URL_ATTRIBUTES_BY_TAG: Record<string, Set<string>> = {
  a: new Set(['href', 'xlinkhref']),
  area: new Set(['href']),
  form: new Set(['action']),
  button: new Set(['formaction']),
  input: new Set(['formaction']),
};

export const isNavigationUrlAttribute = (
  htmlTag: string,
  key: string,
): boolean =>
  NAVIGATION_URL_ATTRIBUTES_BY_TAG[htmlTag.toLowerCase()]?.has(
    key.toLowerCase().replace(/:/g, ''),
  ) ?? false;
