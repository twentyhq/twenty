import { isAiChatChannelPath } from '~/utils/isAiChatChannelPath';
import { isAiChatPath } from '~/utils/isAiChatPath';

// The chat page and the channel pages are one place: moving between them is
// not leaving the chat, and both are browsed from the AI mode of the drawer.
export const isAiChatAreaPath = (pathname: string) =>
  isAiChatPath(pathname) || isAiChatChannelPath(pathname);
