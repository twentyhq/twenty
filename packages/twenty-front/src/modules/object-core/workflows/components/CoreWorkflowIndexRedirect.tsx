import { Navigate, useLocation } from 'react-router-dom';
import { AppPath } from 'twenty-shared/types';
import { getAppPath } from 'twenty-shared/utils';

export const CoreWorkflowIndexRedirect = () => {
  const { search, hash, state } = useLocation();

  return (
    <Navigate
      replace
      to={{
        pathname: getAppPath(AppPath.WorkflowCoreIndexPage),
        search,
        hash,
      }}
      state={state}
    />
  );
};
