import { type LinkedinContactAutoCreationPolicy } from 'src/types/linkedin-contact-auto-creation-policy.type';
import { type LinkedinHistoryConversationLimit } from 'src/types/linkedin-history-conversation-limit.type';
import { type LinkedinImportPolicy } from 'src/types/linkedin-import-policy.type';

export type LinkedinSettings = {
  importPolicy: LinkedinImportPolicy;
  areGroupChatsImported: boolean;
  historyConversationLimit: LinkedinHistoryConversationLimit;
  contactAutoCreationPolicy: LinkedinContactAutoCreationPolicy;
  isNameMatchingEnabled: boolean;
};
