import { useLingui } from '@lingui/react/macro';
import { useContext } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { CommandMenuContext } from '@/command-menu-item/contexts/CommandMenuContext';
import { useCurrentCoreAgent } from '@/object-core/agents/hooks/useCurrentCoreAgent';
import { CORE_AGENT_DELETE_CURRENT_COMMAND_ID } from '@/object-core/commands/constants/CoreAgentDeleteCurrentCommandId';
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
    deleteCurrentCommandLabel,
    shouldDisplayDeleteCurrentCommand,
    coreAgentPageCommandIds: [
      ...(shouldDisplayDeleteCurrentCommand
        ? [CORE_AGENT_DELETE_CURRENT_COMMAND_ID]
        : []),
    ],
  };
};
