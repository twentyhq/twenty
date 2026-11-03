import { matchPath } from 'react-router-dom';
import { AppPath } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

export const isCoreAgentPath = (pathname: string) =>
  isDefined(matchPath(AppPath.AgentIndexPage, pathname)) ||
  isDefined(matchPath(AppPath.AgentShowPage, pathname));
