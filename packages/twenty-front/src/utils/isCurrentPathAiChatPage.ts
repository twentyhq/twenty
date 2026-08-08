import { matchPath } from 'react-router-dom';
import { AppPath } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

// Read from window.location at call time: callers run from hotkeys, engine
// commands and streaming callbacks that can outlive a route change, and in
// contexts without a router.
export const isCurrentPathAiChatPage = () =>
  isDefined(matchPath(AppPath.AiChat, window.location.pathname));
