import { redirectIfNotLoggedIn } from '../hooks/AuthenticationHooks';

function RequireAuth({ children }: { children: JSX.Element }): JSX.Element {
  redirectIfNotLoggedIn();

  return children;
}

export default RequireAuth;
