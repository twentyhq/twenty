import { INBOX_OBJECT_NAMES } from '@/ai-chat/constants/InboxObjectNames';
import { LEGACY_INBOX_OBJECT_NAMES } from '@/ai-chat/constants/LegacyInboxObjectNames';

export const isInboxThreadObjectName = (
  objectNameSingular: string | null | undefined,
) =>
  objectNameSingular === LEGACY_INBOX_OBJECT_NAMES.agentChatThread ||
  objectNameSingular === INBOX_OBJECT_NAMES.agentChatThread;
