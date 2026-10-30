import { type LinkedinSettings } from 'src/types/linkedin-settings.type';

export const DEFAULT_LINKEDIN_SETTINGS: LinkedinSettings = {
  importRange: 'LAST_90_DAYS',
  contactAutoCreationPolicy: 'SENT',
  isNameMatchingEnabled: true,
  areGroupConversationsExcluded: false,
};
