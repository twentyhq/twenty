import { type LinkedinContactAutoCreationPolicy } from 'src/types/linkedin-contact-auto-creation-policy.type';
import { type LinkedinImportPolicy } from 'src/types/linkedin-import-policy.type';
import { type LinkedinSelectedChat } from 'src/types/linkedin-selected-chat.type';

export type LinkedinSettings = {
  importPolicy: LinkedinImportPolicy;
  selectedChats: LinkedinSelectedChat[];
  areGroupChatsImported: boolean;
  contactAutoCreationPolicy: LinkedinContactAutoCreationPolicy;
  isNameMatchingEnabled: boolean;
  areChatsMarkedAsRead: boolean;
};
