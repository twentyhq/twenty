import { type LinkedinContactAutoCreationPolicy } from 'src/types/linkedin-contact-auto-creation-policy.type';
import { type LinkedinImportRange } from 'src/types/linkedin-import-range.type';

export type LinkedinSettings = {
  importRange: LinkedinImportRange;
  contactAutoCreationPolicy: LinkedinContactAutoCreationPolicy;
  isNameMatchingEnabled: boolean;
  areGroupConversationsExcluded: boolean;
};
