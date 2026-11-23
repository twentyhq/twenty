import { matchPath, useLocation } from 'react-router-dom';
import { AppPath } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

export const useIsCoreAgentsIndexPage = () => {
  const location = useLocation();

  return isDefined(matchPath(AppPath.AgentIndexPage, location.pathname));
};
