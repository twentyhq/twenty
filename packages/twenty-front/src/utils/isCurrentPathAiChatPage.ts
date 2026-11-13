import { isInboxThreadPath } from '~/utils/isAiChatPath';

export const isCurrentPathInboxThreadPage = () =>
  isInboxThreadPath(window.location.pathname);
