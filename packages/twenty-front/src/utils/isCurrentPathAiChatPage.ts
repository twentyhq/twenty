import { isAiChatPath } from '~/utils/isAiChatPath';

// Read from window.location at call time: callers run from hotkeys, engine
// commands and streaming callbacks that can outlive a route change, and in
// contexts without a router.
export const isCurrentPathAiChatPage = () =>
  isAiChatPath(window.location.pathname);
