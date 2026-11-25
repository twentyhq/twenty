import { useNavigate } from 'react-router-dom';
import { AppPath } from 'twenty-shared/types';
import { getAppPath } from 'twenty-shared/utils';
import { IconTerminal } from 'twenty-ui/icon';

import { CommandMenuItem } from '@/command-menu/components/CommandMenuItem';
import { CORE_AGENT_SHOW_PAGE_TABS } from '@/object-core/agents/constants/CoreAgentShowPageTabs';
import { CORE_AGENTS_SEE_TURNS_COMMAND_ID } from '@/object-core/commands/constants/CoreAgentsSeeTurnsCommandId';
import { useSidePanelMenu } from '@/side-panel/hooks/useSidePanelMenu';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';

type CoreAgentsSeeTurnsCommandProps = {
  agentId: string;
  label: string;
};

export const CoreAgentsSeeTurnsCommand = ({
  agentId,
  label,
}: CoreAgentsSeeTurnsCommandProps) => {
  const navigate = useNavigate();
  const { closeSidePanelMenu } = useSidePanelMenu();

  const handleSeeTurns = () => {
    closeSidePanelMenu();
    navigate({
      pathname: getAppPath(AppPath.AgentShowPage, { agentId }),
      hash: `#${CORE_AGENT_SHOW_PAGE_TABS.TAB_IDS.TURNS}`,
    });
  };

  return (
    <SelectableListItem
      itemId={CORE_AGENTS_SEE_TURNS_COMMAND_ID}
      onEnter={handleSeeTurns}
    >
      <CommandMenuItem
        id={CORE_AGENTS_SEE_TURNS_COMMAND_ID}
        label={label}
        Icon={IconTerminal}
        onClick={handleSeeTurns}
      />
    </SelectableListItem>
  );
};
