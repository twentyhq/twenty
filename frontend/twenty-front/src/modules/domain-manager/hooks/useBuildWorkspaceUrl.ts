import { isDefined } from 'twenty-shared/utils';
export const useBuildWorkspaceUrl = () => {
  const buildWorkspaceUrl = (
    endpoint: string,
    pathname?: string,
    searchParams?: Record<string, string | boolean>,
  ) => {
    const url = new URL(endpoint);

    if (isDefined(pathname)) {
      url.pathname = pathname;
    }

    if (isDefined(searchParams)) {
      Object.entries(searchParams).forEach(([key, value]) =>
        url.searchParams.set(key, value.toString()),
      );
    }
    return url.toString();
  };

  return {
    buildWorkspaceUrl,
  };
};
