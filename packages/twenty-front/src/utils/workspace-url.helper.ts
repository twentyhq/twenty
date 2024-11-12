import { isDefined } from '~/utils/isDefined';

// TODO AMOREAUX: Check with charles for the env management in the front
export const twentyHostname = process.env.REACT_APP_BASE_URL
  ? new URL(process.env.REACT_APP_BASE_URL).hostname
  : 'twenty.com';

export const twentyHomePage = `app.${twentyHostname}`;

export const isTwentyHosting =
  window.location.hostname.endsWith(twentyHostname);

export const isTwentyHomePage = window.location.hostname === twentyHomePage;

export const isTwentyWorkspaceSubdomain = isTwentyHosting && !isTwentyHomePage;

export const getWorkspaceMainDomain = () => {
  return isTwentyHosting ? twentyHostname : window.location.hostname;
};

export const getWorkspaceSubdomain = () => {
  return isTwentyWorkspaceSubdomain
    ? window.location.hostname.replace(`.${twentyHostname}`, '')
    : null;
};

export const buildWorkspaceUrl = (
  withSubdomain?: string,
  searchParams?: Record<string, string>,
) => {
  const url = new URL(window.location.href);

  if (isTwentyHosting && Boolean(withSubdomain)) {
    url.hostname = `${withSubdomain}.${twentyHostname}`;
  }

  if (isDefined(searchParams)) {
    Object.entries(searchParams).forEach(([key, value]) =>
      url.searchParams.set(key, value),
    );
  }
  return url.toString();
};

export const redirectToHome = () => {
  const url = new URL(window.location.href);
  url.hostname = twentyHomePage;
  window.location.href = url.toString();
};

export const redirectToWorkspace = (
  subdomain: string,
  searchParams?: Record<string, string>,
) => {
  window.location.href = buildWorkspaceUrl(subdomain, searchParams);
};
