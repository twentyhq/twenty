import { buildWorkspaceURL } from 'src/utils/workspace-url.utils';

export function computeRedirectErrorUrl({
  errorMessage,
  frontBaseUrl,
  subdomain,
}: {
  errorMessage: string;
  frontBaseUrl: string;
  subdomain: string | null;
}) {
  const url = buildWorkspaceURL(frontBaseUrl, subdomain, {
    withPathname: '/verify',
    withSearchParams: { errorMessage },
  });

  return url.toString();
}
