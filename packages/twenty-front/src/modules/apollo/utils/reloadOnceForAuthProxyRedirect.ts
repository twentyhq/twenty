import { reloadWindow } from '~/utils/reloadWindow';

const AUTH_PROXY_RELOAD_FLAG = 'twenty:authProxyReloaded';

// A reload is a document navigation, so it follows the proxy redirect the way
// fetch() cannot and lands the user on the identity provider. It runs at most
// once per tab: if a reload does not restore the session, falling back to the
// plain error beats reloading forever.
export const reloadOnceForAuthProxyRedirect = () => {
  try {
    if (sessionStorage.getItem(AUTH_PROXY_RELOAD_FLAG) === 'true') {
      return;
    }

    sessionStorage.setItem(AUTH_PROXY_RELOAD_FLAG, 'true');
  } catch {
    return;
  }

  reloadWindow();
};
