import { isDefined } from '~/utils/isDefined';

export const useBuildWorkspaceUrl = () => {
  const buildWorkspaceUrl = (
    endpoint: string,
    pathname?: string,
    searchParams?: Record<string, string>,
  ) => {
    const url = new URL(endpoint);

    if (isDefined(pathname)) {
      url.pathname = pathname;
    }

    if (isDefined(searchParams)) {
      Object.entries(searchParams).forEach(([key, value]) =>
        url.searchParams.set(key, value),
      );
    }
    return url.toString();
  };

  return {
    buildWorkspaceUrl,
  };
};
