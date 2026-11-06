import { type LinkedinSettings } from 'src/types/linkedin-settings.type';

export const DEFAULT_LINKEDIN_SETTINGS: LinkedinSettings = {
  importPolicy: 'ALL',
  areGroupChatsImported: true,
  historyConversationLimit: 20,
  contactAutoCreationPolicy: 'SENT',
  isNameMatchingEnabled: true,
  // Opt-in: marking a chat as read on LinkedIn can show the sender a read receipt.
  areChatsMarkedAsRead: false,
};
