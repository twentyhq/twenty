export const writeComponentSourceToCache = ({
  cache,
  url,
  source,
}: {
  cache: Cache;
  url: string;
  source: string;
}): void => {
  cache
    .put(
      url,
      new Response(source, {
        headers: { 'Content-Type': 'application/javascript' },
      }),
    )
    .catch(() => undefined);
};
