import { isDefined } from 'twenty-shared/utils';
import { WorkspaceActivationStatus } from 'twenty-shared/workspace';

import { aiChatUISessionStartTimeState } from '@/ai-chat/states/aiChatUISessionStartTimeState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useIsWorkspaceActivationStatusEqualsTo } from '@/workspace/hooks/useIsWorkspaceActivationStatusEqualsTo';

export const useIsAiChatRuntimeEnabled = () => {
  const aiChatUISessionStartTime = useAtomStateValue(
    aiChatUISessionStartTimeState,
  );
  const isWorkspaceSuspended = useIsWorkspaceActivationStatusEqualsTo(
    WorkspaceActivationStatus.SUSPENDED,
  );

  return isDefined(aiChatUISessionStartTime) && !isWorkspaceSuspended;
};
