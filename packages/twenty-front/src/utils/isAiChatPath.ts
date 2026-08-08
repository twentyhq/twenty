import { matchPath } from 'react-router-dom';
import { AppPath } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

export const isAiChatPath = (pathname: string) =>
  isDefined(matchPath(AppPath.AiChat, pathname));
