import { type LinkedinContactAutoCreationPolicy } from 'src/types/linkedin-contact-auto-creation-policy.type';
import { type LinkedinImportPolicy } from 'src/types/linkedin-import-policy.type';

export type LinkedinSettings = {
  importPolicy: LinkedinImportPolicy;
  contactAutoCreationPolicy: LinkedinContactAutoCreationPolicy;
  isNameMatchingEnabled: boolean;
};
