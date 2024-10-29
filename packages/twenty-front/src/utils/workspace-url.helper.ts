export const twentyHostname = process.env.REACT_WEB_APP_BASE_URL
  ? new URL(process.env.REACT_WEB_APP_BASE_URL).hostname
  : 'twenty.com';

export const isTwentyHosting =
  window.location.hostname.endsWith(twentyHostname);

export const isTwentyHomePage =
  window.location.hostname === `app.${twentyHostname}`;

export const isTwentyWorkspaceSubdomain = isTwentyHosting && !isTwentyHomePage;

export const getWorkspaceMaindomain = () => {
  return isTwentyHosting ? twentyHostname : window.location.hostname;
};

export const getWorkspaceSubdomain = () => {
  return isTwentyWorkspaceSubdomain
    ? window.location.hostname.replace(`.${twentyHostname}`, '')
    : null;
};

export const buildWorkspaceUrl = (withSubdomain?: string) => {
  const url = new URL(window.location.href);

  if (isTwentyHosting === true && Boolean(withSubdomain)) {
    url.hostname = `${withSubdomain}.${twentyHostname}`;
  }

  return url.toString();
};
