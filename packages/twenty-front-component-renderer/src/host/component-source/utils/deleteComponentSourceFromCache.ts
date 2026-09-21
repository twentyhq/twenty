export const deleteComponentSourceFromCache = ({
  cache,
  url,
}: {
  cache: Cache;
  url: string;
}): void => {
  cache.delete(url).catch(() => undefined);
};
