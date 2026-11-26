import { IconPlayerPlay } from 'twenty-ui/icon';

import { CommandMenuItem } from '@/command-menu/components/CommandMenuItem';
import { useOpenCoreAgentTestSidePanel } from '@/object-core/agents/hooks/useOpenCoreAgentTestSidePanel';
import { CORE_AGENT_TEST_COMMAND_ID } from '@/object-core/commands/constants/CoreAgentTestCommandId';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';

type CoreAgentTestCommandProps = {
  agentId: string;
  label: string;
};

export const CoreAgentTestCommand = ({
  agentId,
  label,
}: CoreAgentTestCommandProps) => {
  const { openCoreAgentTestSidePanel } = useOpenCoreAgentTestSidePanel();

  const handleTest = () => openCoreAgentTestSidePanel(agentId);

  return (
    <SelectableListItem
      itemId={CORE_AGENT_TEST_COMMAND_ID}
      onEnter={handleTest}
    >
      <CommandMenuItem
        id={CORE_AGENT_TEST_COMMAND_ID}
        label={label}
        Icon={IconPlayerPlay}
        onClick={handleTest}
      />
    </SelectableListItem>
  );
};
