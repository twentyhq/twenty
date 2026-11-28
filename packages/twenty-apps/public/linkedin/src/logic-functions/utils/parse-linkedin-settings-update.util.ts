import {
  isArray,
  isBoolean,
  isNonEmptyString,
  isObject,
  isString,
} from '@sniptt/guards';
import { isDefined } from 'twenty-sdk/utils';

import { LINKEDIN_SELECTED_CHAT_NAME_MAX_LENGTH } from 'src/constants/linkedin-selected-chat-name-max-length.constant';
import { LINKEDIN_SELECTED_CHATS_MAX_COUNT } from 'src/constants/linkedin-selected-chats-max-count.constant';
import { type LinkedinContactAutoCreationPolicy } from 'src/types/linkedin-contact-auto-creation-policy.type';
import { type LinkedinImportPolicy } from 'src/types/linkedin-import-policy.type';
import { type LinkedinSelectedChat } from 'src/types/linkedin-selected-chat.type';
import { type LinkedinSettings } from 'src/types/linkedin-settings.type';
import { type LinkedinVisibility } from 'src/types/linkedin-visibility.type';

const IMPORT_POLICIES: LinkedinImportPolicy[] = [
  'ALL',
  'CONTACTS_ONLY',
  'SELECTED',
];

const CONTACT_AUTO_CREATION_POLICIES: LinkedinContactAutoCreationPolicy[] = [
  'SENT_AND_RECEIVED',
  'SENT',
  'NONE',
];

const VISIBILITIES: LinkedinVisibility[] = ['SHARE_EVERYTHING', 'METADATA'];

const isOneOf = <TValue extends string | number>(
  values: readonly TValue[],
  value: unknown,
): value is TValue => values.some((candidate) => candidate === value);

const parseSelectedChats = (
  value: unknown,
): LinkedinSelectedChat[] | undefined => {
  if (!isArray(value) || value.length > LINKEDIN_SELECTED_CHATS_MAX_COUNT) {
    return undefined;
  }

  const selectedChatById = new Map<string, LinkedinSelectedChat>();

  for (const chat of value) {
    if (!isObject(chat) || !('id' in chat) || !isNonEmptyString(chat.id)) {
      return undefined;
    }

    selectedChatById.set(chat.id, {
      id: chat.id,
      name:
        'name' in chat && isString(chat.name)
          ? chat.name.slice(0, LINKEDIN_SELECTED_CHAT_NAME_MAX_LENGTH)
          : '',
    });
  }

  return [...selectedChatById.values()];
};

export const parseLinkedinSettingsUpdate = (
  body: Record<string, unknown> | null | undefined,
): Partial<LinkedinSettings> & { visibility?: LinkedinVisibility } => {
  const update: Partial<LinkedinSettings> & {
    visibility?: LinkedinVisibility;
  } = {};

  if (isOneOf(IMPORT_POLICIES, body?.importPolicy)) {
    update.importPolicy = body.importPolicy;
  }

  const selectedChats = parseSelectedChats(body?.selectedChats);

  if (isDefined(selectedChats)) {
    update.selectedChats = selectedChats;
  }

  if (
    isOneOf(CONTACT_AUTO_CREATION_POLICIES, body?.contactAutoCreationPolicy)
  ) {
    update.contactAutoCreationPolicy = body.contactAutoCreationPolicy;
  }

  if (isBoolean(body?.isNameMatchingEnabled)) {
    update.isNameMatchingEnabled = body.isNameMatchingEnabled;
  }

  if (isBoolean(body?.areChatsMarkedAsRead)) {
    update.areChatsMarkedAsRead = body.areChatsMarkedAsRead;
  }

  if (isBoolean(body?.isPersonEnrichmentEnabled)) {
    update.isPersonEnrichmentEnabled = body.isPersonEnrichmentEnabled;
  }

  if (isOneOf(VISIBILITIES, body?.visibility)) {
    update.visibility = body.visibility;
  }

  return update;
};
