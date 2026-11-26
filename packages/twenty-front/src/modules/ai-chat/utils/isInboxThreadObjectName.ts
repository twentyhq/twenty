import {
  INBOX_OBJECT_NAMES_BY_LEGACY_NAME,
  LEGACY_INBOX_OBJECT_NAMES_BY_LEGACY_NAME,
} from 'twenty-shared/ai';

// TODO(@bosiraphael): remove the legacy name with IS_INBOX_OBJECT_NAMING_ENABLED
export const isInboxThreadObjectName = (
  objectNameSingular: string | null | undefined,
) =>
  objectNameSingular ===
    LEGACY_INBOX_OBJECT_NAMES_BY_LEGACY_NAME.agentChatThread ||
  objectNameSingular === INBOX_OBJECT_NAMES_BY_LEGACY_NAME.agentChatThread;
