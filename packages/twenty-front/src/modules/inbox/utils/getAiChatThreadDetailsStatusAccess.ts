import { isDefined } from 'twenty-shared/utils';

import { type AiChatThreadRecord } from '@/ai-chat/threads/types/AiChatThreadRecord';
import { type AiChatThreadStatusScope } from '@/inbox/types/AiChatThreadStatusScope';
import { type AiChatThreadTriageStatus } from '@/inbox/types/AiChatThreadTriageStatus';
import { type RecordPermissionsDto } from '~/generated-metadata/graphql';

export const getAiChatThreadDetailsStatusAccess = ({
  thread,
  permissions,
  triageStatus,
  scope,
  isInChannel,
}: {
  thread: Pick<AiChatThreadRecord, 'deletedAt'> | null;
  permissions: Pick<RecordPermissionsDto, 'canRead' | 'canUpdate'> | undefined;
  triageStatus: AiChatThreadTriageStatus | undefined;
  scope: AiChatThreadStatusScope | undefined;
  isInChannel: boolean;
}) => {
  const isThreadAvailable =
    isDefined(thread) &&
    !isDefined(thread.deletedAt) &&
    (permissions?.canRead ?? false);

  if (!isThreadAvailable || !isDefined(triageStatus)) {
    return { status: undefined, canChangeStatus: false };
  }

  return {
    status: triageStatus,
    canChangeStatus:
      isDefined(scope) && (!isInChannel || (permissions?.canUpdate ?? false)),
  };
};
