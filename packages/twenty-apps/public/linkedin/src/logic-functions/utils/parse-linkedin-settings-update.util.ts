import { isBoolean } from '@sniptt/guards';

import { type LinkedinContactAutoCreationPolicy } from 'src/types/linkedin-contact-auto-creation-policy.type';
import { type LinkedinImportPolicy } from 'src/types/linkedin-import-policy.type';
import { type LinkedinSettings } from 'src/types/linkedin-settings.type';
import { type LinkedinVisibility } from 'src/types/linkedin-visibility.type';

const IMPORT_POLICIES: LinkedinImportPolicy[] = ['ALL', 'CONTACTS_ONLY'];

const CONTACT_AUTO_CREATION_POLICIES: LinkedinContactAutoCreationPolicy[] = [
  'SENT_AND_RECEIVED',
  'SENT',
  'NONE',
];

const VISIBILITIES: LinkedinVisibility[] = ['SHARE_EVERYTHING', 'METADATA'];

const isOneOf = <TValue extends string>(
  values: TValue[],
  value: unknown,
): value is TValue => values.some((candidate) => candidate === value);

export const parseLinkedinSettingsUpdate = (
  body: Record<string, unknown> | null | undefined,
): Partial<LinkedinSettings> & { visibility?: LinkedinVisibility } => {
  const update: Partial<LinkedinSettings> & {
    visibility?: LinkedinVisibility;
  } = {};

  if (isOneOf(IMPORT_POLICIES, body?.importPolicy)) {
    update.importPolicy = body.importPolicy;
  }

  if (
    isOneOf(CONTACT_AUTO_CREATION_POLICIES, body?.contactAutoCreationPolicy)
  ) {
    update.contactAutoCreationPolicy = body.contactAutoCreationPolicy;
  }

  if (isBoolean(body?.areGroupChatsImported)) {
    update.areGroupChatsImported = body.areGroupChatsImported;
  }

  if (isBoolean(body?.isNameMatchingEnabled)) {
    update.isNameMatchingEnabled = body.isNameMatchingEnabled;
  }

  if (isOneOf(VISIBILITIES, body?.visibility)) {
    update.visibility = body.visibility;
  }

  return update;
};
