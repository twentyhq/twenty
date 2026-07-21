import { appendSearchParamsToUrl } from 'src/engine/core-modules/domain/domain-server-config/utils/append-search-params-to-url.util';

type BuildUrlWithPathnameAndSearchParamsProps = {
  baseUrl: URL;
  pathname?: string;
  searchParams?: Record<string, string | number | boolean>;
  hash?: string;
};

export const buildUrlWithPathnameAndSearchParams = ({
  baseUrl,
  pathname,
  searchParams,
  hash,
}: BuildUrlWithPathnameAndSearchParamsProps) => {
  const url = baseUrl;

  if (pathname) {
    url.pathname = pathname;
  }

  if (searchParams) {
    appendSearchParamsToUrl(url, searchParams);
  }

  if (hash) {
    url.hash = hash;
  }

  return url;
};
