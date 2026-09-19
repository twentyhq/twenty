import { useLingui } from '@lingui/react/macro';

import { AGENT_CHAT_THREAD_INBOX_STATE_ICONS } from '@/ai/constants/AgentChatThreadInboxStateIcons';
import { AGENT_CHAT_THREAD_INBOX_STATE_LABELS } from '@/ai/constants/AgentChatThreadInboxStateLabels';
import { useAiChatUnreadThreadCount } from '@/ai/hooks/useAiChatUnreadThreadCount';
import { type AgentChatThreadInboxState } from '@/ai/types/AgentChatThreadInboxState';
import { type FlatAgentChatThread } from '@/metadata-store/types/FlatAgentChatThread';
import { NavigationDrawerItem } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerItem';

type NavigationDrawerAiChatInboxStateItemProps = {
  inboxState: AgentChatThreadInboxState;
  threads: FlatAgentChatThread[];
  active: boolean;
  onClick: () => void;
};

// The badge counts what is waiting, not what exists: a running total of
// everything ever filed here grows past the point of telling anybody
// anything, and the list itself is one click away.
export const NavigationDrawerAiChatInboxStateItem = ({
  inboxState,
  threads,
  active,
  onClick,
}: NavigationDrawerAiChatInboxStateItemProps) => {
  const { t } = useLingui();
  const unreadThreadCount = useAiChatUnreadThreadCount(threads);

  return (
    <NavigationDrawerItem
      Icon={AGENT_CHAT_THREAD_INBOX_STATE_ICONS[inboxState]}
      label={t(AGENT_CHAT_THREAD_INBOX_STATE_LABELS[inboxState])}
      active={active}
      secondaryLabel={
        unreadThreadCount > 0 ? String(unreadThreadCount) : undefined
      }
      onClick={onClick}
    />
  );
};
