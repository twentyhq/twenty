import { createSearchParams, Navigate, useLocation } from 'react-router-dom';
import { AppPath } from 'twenty-shared/types';

export const RootAuthorizeRedirect = () => {
  const { hash, pathname, search } = useLocation();

  const returnToPath = `${pathname}${search}${hash}`;

  return (
    <Navigate
      to={{
        pathname: AppPath.SignInUp,
        search: createSearchParams({ returnToPath }).toString(),
      }}
      replace
    />
  );
};
