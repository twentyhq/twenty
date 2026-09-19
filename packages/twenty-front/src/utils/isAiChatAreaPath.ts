import { isAiChatChannelPath } from '~/utils/isAiChatChannelPath';
import { isAiChatInboxPath, isAiChatPath } from '~/utils/isAiChatPath';

// The chat page, the inbox and the channel pages are one place: moving
// between them is not leaving the chat, and all three are browsed from the AI
// mode of the drawer. A page of the area shows the thread it is given in
// place, so nothing here hands one to the side panel.
export const isAiChatAreaPath = (pathname: string) =>
  isAiChatPath(pathname) ||
  isAiChatInboxPath(pathname) ||
  isAiChatChannelPath(pathname);
