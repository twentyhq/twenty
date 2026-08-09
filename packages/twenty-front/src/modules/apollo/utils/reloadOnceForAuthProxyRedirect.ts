import { reloadWindow } from '~/utils/reloadWindow';

const AUTH_PROXY_RELOAD_FLAG = 'twenty:authProxyReloaded';

// A reload is a document navigation, so it follows the proxy redirect the way
// fetch() cannot and lands the user on the identity provider. Guarded so that a
// reload which does not restore the session degrades to the plain error instead
// of looping. The guard is lifted by clearAuthProxyReloadGuard as soon as any
// request succeeds, so a later expiry in the same tab still recovers.
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

export const clearAuthProxyReloadGuard = () => {
  try {
    sessionStorage.removeItem(AUTH_PROXY_RELOAD_FLAG);
  } catch {
    // a browser without usable session storage never set the guard
  }
};
