export const isChatGptOAuthRedirectUri = (redirectUri: string): boolean => {
  try {
    const { origin, pathname } = new URL(redirectUri);

    return (
      origin === 'https://chatgpt.com' &&
      (pathname === '/connector_platform_oauth_redirect' ||
        /^\/connector\/oauth\/[^/]+$/.test(pathname))
    );
  } catch {
    return false;
  }
};
