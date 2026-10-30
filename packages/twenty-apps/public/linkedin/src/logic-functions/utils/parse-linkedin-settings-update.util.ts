import { isBoolean, isString } from '@sniptt/guards';

import { LINKEDIN_IMPORT_RANGE_DAYS } from 'src/constants/linkedin-import-range-days.constant';
import { type LinkedinContactAutoCreationPolicy } from 'src/types/linkedin-contact-auto-creation-policy.type';
import { type LinkedinImportRange } from 'src/types/linkedin-import-range.type';
import { type LinkedinSettings } from 'src/types/linkedin-settings.type';

const CONTACT_AUTO_CREATION_POLICIES: LinkedinContactAutoCreationPolicy[] = [
  'SENT_AND_RECEIVED',
  'SENT',
  'NONE',
];

const isLinkedinImportRange = (value: unknown): value is LinkedinImportRange =>
  isString(value) && Object.keys(LINKEDIN_IMPORT_RANGE_DAYS).includes(value);

const isLinkedinContactAutoCreationPolicy = (
  value: unknown,
): value is LinkedinContactAutoCreationPolicy =>
  CONTACT_AUTO_CREATION_POLICIES.some((policy) => policy === value);

export const parseLinkedinSettingsUpdate = (
  body: Record<string, unknown> | null | undefined,
): Partial<LinkedinSettings> => {
  const update: Partial<LinkedinSettings> = {};

  if (isLinkedinImportRange(body?.importRange)) {
    update.importRange = body.importRange;
  }

  if (isLinkedinContactAutoCreationPolicy(body?.contactAutoCreationPolicy)) {
    update.contactAutoCreationPolicy = body.contactAutoCreationPolicy;
  }

  if (isBoolean(body?.isNameMatchingEnabled)) {
    update.isNameMatchingEnabled = body.isNameMatchingEnabled;
  }

  if (isBoolean(body?.areGroupConversationsExcluded)) {
    update.areGroupConversationsExcluded = body.areGroupConversationsExcluded;
  }

  return update;
};
