import { Navigate, useLocation } from 'react-router-dom';

type NavigatePreservingSearchAndHashProps = {
  to: string;
};

export const NavigatePreservingSearchAndHash = ({
  to,
}: NavigatePreservingSearchAndHashProps) => {
  const location = useLocation();

  return (
    <Navigate
      to={{ pathname: to, search: location.search, hash: location.hash }}
      replace
    />
  );
};
