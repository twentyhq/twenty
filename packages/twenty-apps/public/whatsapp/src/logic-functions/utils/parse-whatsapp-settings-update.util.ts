import { isArray, isBoolean, isNonEmptyString } from '@sniptt/guards';

import { WHATSAPP_HISTORY_CONVERSATION_LIMITS } from 'src/constants/whatsapp-history-conversation-limits.constant';
import { WHATSAPP_SELECTED_CHATS_MAX_COUNT } from 'src/constants/whatsapp-selected-chats-max-count.constant';
import { type WhatsappContactAutoCreationPolicy } from 'src/types/whatsapp-contact-auto-creation-policy.type';
import { type WhatsappImportPolicy } from 'src/types/whatsapp-import-policy.type';
import { type WhatsappSettings } from 'src/types/whatsapp-settings.type';
import { type WhatsappVisibility } from 'src/types/whatsapp-visibility.type';

const IMPORT_POLICIES: WhatsappImportPolicy[] = [
  'ALL',
  'CONTACTS_ONLY',
  'SELECTED',
];

const CONTACT_AUTO_CREATION_POLICIES: WhatsappContactAutoCreationPolicy[] = [
  'SENT_AND_RECEIVED',
  'SENT',
  'NONE',
];

const VISIBILITIES: WhatsappVisibility[] = ['SHARE_EVERYTHING', 'METADATA'];

const isOneOf = <TValue extends string | number>(
  values: readonly TValue[],
  value: unknown,
): value is TValue => values.some((candidate) => candidate === value);

export const parseWhatsappSettingsUpdate = (
  body: Record<string, unknown> | null | undefined,
): Partial<WhatsappSettings> & { visibility?: WhatsappVisibility } => {
  const update: Partial<WhatsappSettings> & {
    visibility?: WhatsappVisibility;
  } = {};

  if (isOneOf(IMPORT_POLICIES, body?.importPolicy)) {
    update.importPolicy = body.importPolicy;
  }

  if (
    isArray(body?.selectedChatIds) &&
    body.selectedChatIds.every(isNonEmptyString) &&
    body.selectedChatIds.length <= WHATSAPP_SELECTED_CHATS_MAX_COUNT
  ) {
    update.selectedChatIds = [...new Set(body.selectedChatIds)];
  }

  if (
    isOneOf(CONTACT_AUTO_CREATION_POLICIES, body?.contactAutoCreationPolicy)
  ) {
    update.contactAutoCreationPolicy = body.contactAutoCreationPolicy;
  }

  if (isBoolean(body?.areGroupChatsImported)) {
    update.areGroupChatsImported = body.areGroupChatsImported;
  }

  if (
    isOneOf(
      WHATSAPP_HISTORY_CONVERSATION_LIMITS,
      body?.historyConversationLimit,
    )
  ) {
    update.historyConversationLimit = body.historyConversationLimit;
  }

  if (isBoolean(body?.areChatsMarkedAsRead)) {
    update.areChatsMarkedAsRead = body.areChatsMarkedAsRead;
  }

  if (isOneOf(VISIBILITIES, body?.visibility)) {
    update.visibility = body.visibility;
  }

  return update;
};
