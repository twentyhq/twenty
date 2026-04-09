export const appendSearchParamsToUrl = (
  url: URL,
  searchParams: Record<string, string | number | boolean>,
) => {
  Object.entries(searchParams).forEach(([key, value]) => {
    url.searchParams.set(key, value.toString());
  });
};
