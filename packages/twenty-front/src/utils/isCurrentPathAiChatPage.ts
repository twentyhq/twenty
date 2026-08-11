import { isAiChatPath } from '~/utils/isAiChatPath';

export const isCurrentPathAiChatPage = () =>
  isAiChatPath(window.location.pathname);
