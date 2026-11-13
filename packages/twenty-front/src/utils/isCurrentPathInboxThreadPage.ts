import { isInboxThreadPath } from '~/utils/isInboxThreadPath';

export const isCurrentPathInboxThreadPage = () =>
  isInboxThreadPath(window.location.pathname);
