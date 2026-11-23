import { useLingui } from '@lingui/react/macro';
import { useContext } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { CommandMenuContext } from '@/command-menu-item/contexts/CommandMenuContext';
import { useCanTestCoreAgents } from '@/object-core/agents/hooks/useCanTestCoreAgents';
import { useCoreAgentDirtyState } from '@/object-core/agents/hooks/useCoreAgentDirtyState';
import { useCurrentCoreAgent } from '@/object-core/agents/hooks/useCurrentCoreAgent';
import { CORE_AGENT_DELETE_CURRENT_COMMAND_ID } from '@/object-core/commands/constants/CoreAgentDeleteCurrentCommandId';
import { CORE_AGENT_TEST_COMMAND_ID } from '@/object-core/commands/constants/CoreAgentTestCommandId';
import { isMatchingSidePanelSearch } from '@/object-core/commands/utils/isMatchingSidePanelSearch';
import { useGetIsMetadataItemCustom } from '@/object-metadata/hooks/useGetIsMetadataItemCustom';
import { sidePanelSearchState } from '@/side-panel/states/sidePanelSearchState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export const useCoreAgentPageCommands = () => {
  const { t } = useLingui();
  const { isInPreviewMode } = useContext(CommandMenuContext);
  const sidePanelSearch = useAtomStateValue(sidePanelSearchState);
  const getIsMetadataItemCustom = useGetIsMetadataItemCustom();
  const currentCoreAgent = useCurrentCoreAgent();
  const canTestCoreAgents = useCanTestCoreAgents();
  const { isDirty } = useCoreAgentDirtyState(currentCoreAgent);

  const testCommandLabel = t`Test Agent`;
  // a test runs the saved agent, so it waits for pending edits to be saved or discarded
  const shouldDisplayTestCommand =
    isDefined(currentCoreAgent) &&
    currentCoreAgent.isActive &&
    canTestCoreAgents &&
    !isDirty &&
    !isInPreviewMode &&
    isMatchingSidePanelSearch({ label: testCommandLabel, sidePanelSearch });

  const deleteCurrentCommandLabel = t`Delete Agent`;
  const shouldDisplayDeleteCurrentCommand =
    isDefined(currentCoreAgent) &&
    getIsMetadataItemCustom(currentCoreAgent) &&
    !isInPreviewMode &&
    isMatchingSidePanelSearch({
      label: deleteCurrentCommandLabel,
      sidePanelSearch,
    });

  return {
    currentCoreAgent,
    testCommandLabel,
    shouldDisplayTestCommand,
    deleteCurrentCommandLabel,
    shouldDisplayDeleteCurrentCommand,
    coreAgentPageCommandIds: [
      ...(shouldDisplayTestCommand ? [CORE_AGENT_TEST_COMMAND_ID] : []),
      ...(shouldDisplayDeleteCurrentCommand
        ? [CORE_AGENT_DELETE_CURRENT_COMMAND_ID]
        : []),
    ],
  };
};
