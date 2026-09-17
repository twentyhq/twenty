import { isAiChatAreaPath } from '~/utils/isAiChatAreaPath';

export const isCurrentPathAiChatArea = () =>
  isAiChatAreaPath(window.location.pathname);
