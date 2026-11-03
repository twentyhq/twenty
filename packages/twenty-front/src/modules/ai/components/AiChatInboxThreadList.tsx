import { type MouseEvent } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { AiChatThreadList } from '@/ai/components/AiChatThreadList';
import { AGENT_CHAT_THREAD_FILTER_STATUS } from '@/ai/constants/AgentChatThreadFilterStatus';
import { agentChatThreadFilterStatusState } from '@/ai/states/agentChatThreadFilterStatusState';
import { agentChatThreadParticipantsState } from '@/ai/states/agentChatThreadParticipantsState';
import { agentChatShownChannelViewSelector } from '@/ai/states/selectors/agentChatShownChannelViewSelector';
import { type AgentChatThreadRecord } from '@/ai/types/AgentChatThreadRecord';
import { useOpenRecordContextMenu } from '@/object-record/record-selection/hooks/useOpenRecordContextMenu';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { AgentChatChannelThreadStatus } from '~/generated-metadata/graphql';

type AiChatInboxThreadListProps = {
  threads: AgentChatThreadRecord[];
  selectedThreadIds: string[];
  checkedThreadIds: string[];
  onThreadClick: (
    thread: AgentChatThreadRecord,
    event: MouseEvent<HTMLDivElement>,
  ) => void;
  onThreadCheckboxClick?: (
    thread: AgentChatThreadRecord,
    event: MouseEvent<HTMLDivElement>,
  ) => void;
};

export const AiChatInboxThreadList = ({
  threads,
  selectedThreadIds,
  checkedThreadIds,
  onThreadClick,
  onThreadCheckboxClick,
}: AiChatInboxThreadListProps) => {
  const { openRecordContextMenu } = useOpenRecordContextMenu();
  const agentChatShownChannelView = useAtomStateValue(
    agentChatShownChannelViewSelector,
  );
  const agentChatThreadFilterStatus = useAtomStateValue(
    agentChatThreadFilterStatusState,
  );
  const agentChatThreadParticipants = useAtomStateValue(
    agentChatThreadParticipantsState,
  );
  const isSnoozedView = isDefined(agentChatShownChannelView)
    ? agentChatShownChannelView.channelStatus ===
      AgentChatChannelThreadStatus.SNOOZED
    : agentChatThreadFilterStatus === AGENT_CHAT_THREAD_FILTER_STATUS.SNOOZED;
  const snoozedUntilByThreadId = isSnoozedView
    ? Object.fromEntries(
        threads.flatMap<[string, string]>((thread) => {
          const snoozedUntil = isDefined(agentChatShownChannelView)
            ? thread.channelSnoozedUntil
            : agentChatThreadParticipants?.[thread.id]?.snoozedUntil;

          return isDefined(snoozedUntil) ? [[thread.id, snoozedUntil]] : [];
        }),
      )
    : undefined;

  return (
    <AiChatThreadList
      threads={threads}
      selectedThreadIds={selectedThreadIds}
      checkedThreadIds={checkedThreadIds}
      snoozedUntilByThreadId={snoozedUntilByThreadId}
      onThreadClick={onThreadClick}
      onThreadCheckboxClick={onThreadCheckboxClick}
      onThreadContextMenu={(thread, event) =>
        openRecordContextMenu({ event, recordId: thread.id })
      }
    />
  );
};
