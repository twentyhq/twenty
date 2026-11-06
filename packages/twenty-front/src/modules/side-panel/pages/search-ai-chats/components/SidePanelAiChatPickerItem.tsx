import { useLingui } from '@lingui/react/macro';
import { IconMessage } from 'twenty-ui/icon';

import { useAgentChatThreadDisplayLabel } from '@/ai/hooks/useAgentChatThreadDisplayLabel';
import { type AgentChatThreadDisplayIdentity } from '@/ai/types/AgentChatThreadDisplayIdentity';
import { CommandMenuItem } from '@/command-menu/components/CommandMenuItem';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';

type SidePanelAiChatPickerItemProps = {
  thread: AgentChatThreadDisplayIdentity & { id: string };
  isOpeningThread: boolean;
  onOpen: (threadId: string) => void;
};

export const SidePanelAiChatPickerItem = ({
  thread,
  isOpeningThread,
  onOpen,
}: SidePanelAiChatPickerItemProps) => {
  const { t } = useLingui();
  const displayLabel = useAgentChatThreadDisplayLabel({
    thread,
    fallbackLabel: t`New chat`,
  });

  return (
    <SelectableListItem
      itemId={thread.id}
      onEnter={isOpeningThread ? undefined : () => onOpen(thread.id)}
    >
      <CommandMenuItem
        id={thread.id}
        Icon={IconMessage}
        label={displayLabel}
        disabled={isOpeningThread}
        onClick={() => onOpen(thread.id)}
      />
    </SelectableListItem>
  );
};
