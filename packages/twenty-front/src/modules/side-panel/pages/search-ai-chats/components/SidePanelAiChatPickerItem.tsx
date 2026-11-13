import { useLingui } from '@lingui/react/macro';
import { IconMessage } from 'twenty-ui/icon';

import { useInboxThreadDisplayLabel } from '@/ai/hooks/useAgentChatThreadDisplayLabel';
import { type InboxThreadDisplayIdentity } from '@/ai/types/AgentChatThreadDisplayIdentity';
import { CommandMenuItem } from '@/command-menu/components/CommandMenuItem';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';

type SidePanelInboxPickerItemProps = {
  thread: InboxThreadDisplayIdentity & { id: string };
  isOpeningThread: boolean;
  onOpen: (threadId: string) => void;
};

export const SidePanelInboxPickerItem = ({
  thread,
  isOpeningThread,
  onOpen,
}: SidePanelInboxPickerItemProps) => {
  const { t } = useLingui();
  const displayLabel = useInboxThreadDisplayLabel({
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
