import { appendSearchParamsToUrl } from 'src/engine/core-modules/domain/domain-server-config/utils/append-search-params-to-url.util';

type BuildUrlWithPathnameAndSearchParamsProps = {
  baseUrl: URL;
  pathname?: string;
  searchParams?: Record<string, string | number | boolean>;
};

export const buildUrlWithPathnameAndSearchParams = ({
  baseUrl,
  pathname,
  searchParams,
}: BuildUrlWithPathnameAndSearchParamsProps) => {
  const url = baseUrl;

  if (pathname) {
    url.pathname = pathname;
  }

  if (searchParams) {
    appendSearchParamsToUrl(url, searchParams);
  }

  return url;
};
