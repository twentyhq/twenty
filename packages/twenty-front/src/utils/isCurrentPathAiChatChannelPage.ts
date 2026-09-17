import { isAiChatChannelPath } from '~/utils/isAiChatChannelPath';

export const isCurrentPathAiChatChannelPage = () =>
  isAiChatChannelPath(window.location.pathname);
