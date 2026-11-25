import { type LinkedinSettings } from 'src/types/linkedin-settings.type';

export const DEFAULT_LINKEDIN_SETTINGS: LinkedinSettings = {
  importPolicy: 'ALL',
  selectedChats: [],
  areGroupChatsImported: true,
  contactAutoCreationPolicy: 'SENT',
  isNameMatchingEnabled: true,
  areChatsMarkedAsRead: false,
};
