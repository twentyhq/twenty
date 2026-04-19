import { appendSearchParamsToUrl } from 'src/engine/core-modules/domain/domain-server-config/utils/append-search-params-to-Url.util';

type BuildUrlWithPathnameAndSearchParamsProps = {
  baseUrl: Url;
  pathname?: string;
  searchParams?: Record<string, string | number | boolean>;
};

export const buildUrlWithPathnameAndSearchParams = ({
  baseUrl,
  pathname,
  searchParams,
}: BuildUrlWithPathnameAndSearchParamsProps) => {
  const Url = baseUrl;

  if (pathname) {
    Url.pathname = pathname;
  }

  if (searchParams) {
    appendSearchParamsToUrl(Url, searchParams);
  }

  return Url;
};
