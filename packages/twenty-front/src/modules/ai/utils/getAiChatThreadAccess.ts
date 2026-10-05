import { isDefined } from 'twenty-shared/utils';

import { AGENT_CHAT_NEW_THREAD_DRAFT_KEY } from '@/ai/states/agentChatDraftsByThreadIdState';
import { type RecordPermissionsDto } from '~/generated-metadata/graphql';

type GetAiChatThreadAccessParams = {
  currentAiChatThread: string | null;
  isOnNewAiChatSlot: boolean;
  permissions: RecordPermissionsDto | undefined;
};

export const getAiChatThreadAccess = ({
  currentAiChatThread,
  isOnNewAiChatSlot,
  permissions,
}: GetAiChatThreadAccessParams) => {
  if (
    !isDefined(currentAiChatThread) ||
    currentAiChatThread === AGENT_CHAT_NEW_THREAD_DRAFT_KEY
  ) {
    return 'writer';
  }
  if (!isDefined(permissions?.canUpdate)) {
    return isOnNewAiChatSlot ? 'writer' : 'loading';
  }
  if (!permissions.canRead) {
    return 'unavailable';
  }
  return permissions.canUpdate ? 'writer' : 'viewer';
};
