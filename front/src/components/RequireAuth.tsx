import AuthService from '../hooks/AuthenticationHooks';

function RequireAuth({ children }: { children: JSX.Element }): JSX.Element {
  const { redirectIfNotLoggedIn } = AuthService;
  redirectIfNotLoggedIn();

  return children;
}

export default RequireAuth;
