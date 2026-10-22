// Desktop clients redirect to custom schemes (cursor://, vscode://), so keep the scheme for those
export const getOAuthRedirectTarget = (redirectUrl: string) => {
  try {
    const url = new URL(redirectUrl);

    if (url.protocol === 'https:' || url.protocol === 'http:') {
      return url.host;
    }

    return `${url.protocol}//${url.host}`;
  } catch {
    return null;
  }
};
