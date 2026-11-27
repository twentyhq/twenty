import { INBOX_OBJECT_NAMES_BY_LEGACY_NAME } from 'twenty-shared/ai';

import { type InboxNamesByLegacyName } from '@/ai-chat/types/InboxNamesByLegacyName';

export const INBOX_NAMES_BY_LEGACY_NAME = {
  ...INBOX_OBJECT_NAMES_BY_LEGACY_NAME,
  relationFields: {
    agentChatThreadTargets: 'inboxThreadTargets',
  },
} as const satisfies InboxNamesByLegacyName;
