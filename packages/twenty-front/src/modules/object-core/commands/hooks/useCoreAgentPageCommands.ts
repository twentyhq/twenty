import { useLingui } from '@lingui/react/macro';
import { useContext } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { CommandMenuContext } from '@/command-menu-item/contexts/CommandMenuContext';
import { useCanTestCoreAgent } from '@/object-core/agents/hooks/useCanTestCoreAgent';
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
  const canTestCurrentCoreAgent = useCanTestCoreAgent(currentCoreAgent);

  const testCommandLabel = t`Test Agent`;
  const shouldDisplayTestCommand =
    canTestCurrentCoreAgent &&
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
