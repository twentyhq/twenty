import { useLingui } from '@lingui/react/macro';
import { useContext } from 'react';
import { PermissionFlagType } from 'twenty-shared/constants';
import { isNonEmptyArray } from 'twenty-shared/utils';

import { CommandMenuContext } from '@/command-menu-item/contexts/CommandMenuContext';
import { useIsCoreAgentsIndexPage } from '@/object-core/agents/hooks/useIsCoreAgentsIndexPage';
import { useSelectedCoreAgentIds } from '@/object-core/agents/hooks/useSelectedCoreAgentIds';
import { CORE_AGENTS_CREATE_COMMAND_ID } from '@/object-core/commands/constants/CoreAgentsCreateCommandId';
import { CORE_AGENTS_FILTERS_COMMAND_ID } from '@/object-core/commands/constants/CoreAgentsFiltersCommandId';
import { isMatchingSidePanelSearch } from '@/object-core/commands/utils/isMatchingSidePanelSearch';
import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { sidePanelSearchState } from '@/side-panel/states/sidePanelSearchState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export const useCoreAgentsIndexCommands = () => {
  const { t } = useLingui();
  const { isInPreviewMode } = useContext(CommandMenuContext);
  const sidePanelSearch = useAtomStateValue(sidePanelSearchState);
  const canManageCoreAgents = useHasPermissionFlag(
    PermissionFlagType.AI_SETTINGS,
  );
  const isCoreAgentsIndexPage = useIsCoreAgentsIndexPage();
  const selectedCoreAgentIds = useSelectedCoreAgentIds();

  const createCommandLabel = t`Create Agent`;
  const shouldDisplayCreateCommand =
    isCoreAgentsIndexPage &&
    !isNonEmptyArray(selectedCoreAgentIds) &&
    !isInPreviewMode &&
    canManageCoreAgents &&
    isMatchingSidePanelSearch({ label: createCommandLabel, sidePanelSearch });

  const filtersCommandLabel = t`Filter agents`;
  const shouldDisplayFiltersCommand =
    isCoreAgentsIndexPage &&
    !isInPreviewMode &&
    isMatchingSidePanelSearch({ label: filtersCommandLabel, sidePanelSearch });

  return {
    createCommandLabel,
    shouldDisplayCreateCommand,
    filtersCommandLabel,
    shouldDisplayFiltersCommand,
    coreAgentsIndexCommandIds: [
      ...(shouldDisplayCreateCommand ? [CORE_AGENTS_CREATE_COMMAND_ID] : []),
      ...(shouldDisplayFiltersCommand ? [CORE_AGENTS_FILTERS_COMMAND_ID] : []),
    ],
  };
};
