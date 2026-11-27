import { type InboxRecordRouteObjectNames } from '@/ai-chat/types/InboxRecordRouteObjectNames';
import { isInboxPath } from '~/utils/isInboxPath';
import { isAiChatPath } from '~/utils/isAiChatPath';

export const isAiModePath = (
  pathname: string,
  inboxRecordRouteObjectNames: InboxRecordRouteObjectNames | null,
) =>
  isAiChatPath(pathname) || isInboxPath(pathname, inboxRecordRouteObjectNames);
