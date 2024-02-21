import { Navigate } from 'react-router-dom';

import { useDefaultHomePagePath } from '~/hooks/useDefaultHomePagePath';

export const DefaultHomePage = () => {
  const { defaultHomePagePath } = useDefaultHomePagePath();

  return <Navigate to={defaultHomePagePath} />;
};
