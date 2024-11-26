// THIS FILE WILL BE REMOVED IN THIS PR:
// https://github.com/twentyhq/twenty/pull/8680
import { isDefined } from '~/utils/isDefined';

export const twentyHostname = window.location.hostname;

export const twentyHomePageHostname = `app.${twentyHostname}`;

export const twentyHomePageUrl = `${window.location.protocol}//${twentyHomePageHostname}`;

export const isTwentyHosting =
  window.location.hostname.endsWith(twentyHostname);

export const isTwentyHomePage =
  window.location.hostname === twentyHomePageHostname;

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

  if (
    isTwentyHosting &&
    isDefined(withSubdomain) &&
    withSubdomain.length !== 0
  ) {
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
  if (url.hostname !== twentyHomePageHostname) {
    url.hostname = twentyHomePageHostname;
    window.location.href = url.toString();
  }
};

export const redirectToWorkspace = (
  subdomain: string,
  searchParams?: Record<string, string>,
) => {
  window.location.href = buildWorkspaceUrl(subdomain, searchParams);
};
