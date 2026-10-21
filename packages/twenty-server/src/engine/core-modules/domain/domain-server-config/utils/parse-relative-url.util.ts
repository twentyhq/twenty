// URL.pathname would percent-encode '?' and '#'; parsing against a fixed base also drops any smuggled host.
export const parseRelativeUrl = (relativeUrl: string) => {
  const { pathname, searchParams, hash } = new URL(
    relativeUrl,
    'http://relative-url.invalid',
  );

  return {
    pathname,
    searchParams: Object.fromEntries(searchParams.entries()),
    hash,
  };
};
