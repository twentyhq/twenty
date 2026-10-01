import { isDefined } from 'twenty-shared/utils';

import { useAgentChatThreadParticipants } from '@/ai/hooks/useAgentChatThreadParticipants';
import { agentChatThreadInboxStatusFamilySelector } from '@/ai/states/selectors/agentChatThreadInboxStatusFamilySelector';
import { agentChatThreadRecordFamilySelector } from '@/ai/states/selectors/agentChatThreadRecordFamilySelector';
import { hasLoadedAgentChatThreadParticipantsState } from '@/ai/states/hasLoadedAgentChatThreadParticipantsState';
import { useOpenSnoozeAiChatInSidePanel } from '@/side-panel/hooks/useOpenSnoozeAiChatInSidePanel';
import { useGlobalHotkeys } from '@/ui/utilities/hotkey/hooks/useGlobalHotkeys';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

type AiChatThreadTriageHotkeysEffectProps = {
  threadId: string;
};

// The keys the pinned Done, Reopen and Snooze commands show in the chat header
export const AiChatThreadTriageHotkeysEffect = ({
  threadId,
}: AiChatThreadTriageHotkeysEffectProps) => {
  const thread = useAtomFamilySelectorValue(
    agentChatThreadRecordFamilySelector,
    threadId,
  );
  const { scope } = useAtomFamilySelectorValue(
    agentChatThreadInboxStatusFamilySelector,
    { threadId, lastActivityAt: null },
  );
  const hasLoadedAgentChatThreadParticipants = useAtomStateValue(
    hasLoadedAgentChatThreadParticipantsState,
  );
  const { archiveAgentChatThread, moveAgentChatThreadToInbox } =
    useAgentChatThreadParticipants();
  const { openSnoozeAiChatInSidePanel } = useOpenSnoozeAiChatInSidePanel();

  const canTriage =
    hasLoadedAgentChatThreadParticipants &&
    isDefined(thread) &&
    !isDefined(thread.deletedAt);

  const toggleDone = () => {
    if (!canTriage) {
      return;
    }

    void (scope === 'INBOX'
      ? archiveAgentChatThread(threadId)
      : moveAgentChatThreadToInbox(threadId));
  };

  const snooze = () => {
    if (canTriage) {
      openSnoozeAiChatInSidePanel(threadId);
    }
  };

  useGlobalHotkeys({
    keys: ['e'],
    callback: toggleDone,
    containsModifier: false,
    dependencies: [toggleDone],
  });

  useGlobalHotkeys({
    keys: ['h'],
    callback: snooze,
    containsModifier: false,
    dependencies: [snooze],
  });

  return null;
};
