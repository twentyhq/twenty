import { AppPath } from 'twenty-shared/types';
import { IconTerminal } from 'twenty-ui/icon';

import { CommandMenuItem } from '@/command-menu/components/CommandMenuItem';
import { coreAgentIsRunsViewFamilyState } from '@/object-core/agents/states/coreAgentIsRunsViewFamilyState';
import { CORE_AGENTS_SEE_RUNS_COMMAND_ID } from '@/object-core/commands/constants/CoreAgentsSeeRunsCommandId';
import { useSidePanelMenu } from '@/side-panel/hooks/useSidePanelMenu';
import { SelectableListItem } from '@/ui/layout/selectable-list/components/SelectableListItem';
import { useSetAtomFamilyState } from '@/ui/utilities/state/jotai/hooks/useSetAtomFamilyState';
import { useNavigateApp } from '~/hooks/useNavigateApp';

type CoreAgentsSeeRunsCommandProps = {
  agentId: string;
  label: string;
};

export const CoreAgentsSeeRunsCommand = ({
  agentId,
  label,
}: CoreAgentsSeeRunsCommandProps) => {
  const navigate = useNavigateApp();
  const { closeSidePanelMenu } = useSidePanelMenu();
  const setCoreAgentIsRunsView = useSetAtomFamilyState(
    coreAgentIsRunsViewFamilyState,
    agentId,
  );

  const handleSeeRuns = () => {
    closeSidePanelMenu();
    setCoreAgentIsRunsView(true);
    navigate(AppPath.AgentShowPage, { agentId });
  };

  return (
    <SelectableListItem
      itemId={CORE_AGENTS_SEE_RUNS_COMMAND_ID}
      onEnter={handleSeeRuns}
    >
      <CommandMenuItem
        id={CORE_AGENTS_SEE_RUNS_COMMAND_ID}
        label={label}
        Icon={IconTerminal}
        onClick={handleSeeRuns}
      />
    </SelectableListItem>
  );
};
