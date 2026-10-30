import { useLingui } from '@lingui/react/macro';
import { useContext } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { CommandMenuContext } from '@/command-menu-item/contexts/CommandMenuContext';
import { useCoreAgentDirtyState } from '@/object-core/agents/hooks/useCoreAgentDirtyState';
import { useCurrentCoreAgent } from '@/object-core/agents/hooks/useCurrentCoreAgent';
import { useIsCoreAgentReadOnly } from '@/object-core/agents/hooks/useIsCoreAgentReadOnly';
import { CORE_AGENT_CANCEL_EDITION_COMMAND_ID } from '@/object-core/commands/constants/CoreAgentCancelEditionCommandId';
import { CORE_AGENT_SAVE_COMMAND_ID } from '@/object-core/commands/constants/CoreAgentSaveCommandId';
import { isMatchingSidePanelSearch } from '@/object-core/commands/utils/isMatchingSidePanelSearch';
import { sidePanelSearchState } from '@/side-panel/states/sidePanelSearchState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export const useCoreAgentEditionCommands = () => {
  const { t } = useLingui();
  const { isInPreviewMode } = useContext(CommandMenuContext);
  const sidePanelSearch = useAtomStateValue(sidePanelSearchState);

  const currentCoreAgent = useCurrentCoreAgent();
  const isCurrentCoreAgentReadOnly = useIsCoreAgentReadOnly({
    applicationId: currentCoreAgent?.applicationId,
  });
  const { isDirty } = useCoreAgentDirtyState(currentCoreAgent);

  const canEditCurrentCoreAgent =
    isDefined(currentCoreAgent) &&
    !isInPreviewMode &&
    !isCurrentCoreAgentReadOnly &&
    isDirty;

  const saveCommandLabel = t`Save Agent`;
  const shouldDisplaySaveCommand =
    canEditCurrentCoreAgent &&
    isMatchingSidePanelSearch({ label: saveCommandLabel, sidePanelSearch });

  const cancelEditionCommandLabel = t`Cancel Edition`;
  const shouldDisplayCancelEditionCommand =
    canEditCurrentCoreAgent &&
    isMatchingSidePanelSearch({
      label: cancelEditionCommandLabel,
      sidePanelSearch,
    });

  return {
    currentCoreAgent,
    saveCommandLabel,
    shouldDisplaySaveCommand,
    cancelEditionCommandLabel,
    shouldDisplayCancelEditionCommand,
    coreAgentEditionCommandIds: [
      ...(shouldDisplaySaveCommand ? [CORE_AGENT_SAVE_COMMAND_ID] : []),
      ...(shouldDisplayCancelEditionCommand
        ? [CORE_AGENT_CANCEL_EDITION_COMMAND_ID]
        : []),
    ],
  };
};
