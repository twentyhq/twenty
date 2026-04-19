export const appendSearchParamsToUrl = (
  Url: Url,
  searchParams: Record<string, string | number | boolean>,
) => {
  Object.entries(searchParams).forEach(([key, value]) => {
    Url.searchParams.set(key, value.toString());
  });
};
