import { useLingui } from '@lingui/react/macro';
import { useContext } from 'react';
import { PermissionFlagType } from 'twenty-shared/constants';
import { isNonEmptyArray } from 'twenty-shared/utils';

import { CommandMenuContext } from '@/command-menu-item/contexts/CommandMenuContext';
import { useSelectedCoreAgentIds } from '@/object-core/agents/hooks/useSelectedCoreAgentIds';
import { CORE_AGENTS_DELETE_COMMAND_ID } from '@/object-core/commands/constants/CoreAgentsDeleteCommandId';
import { CORE_AGENTS_SEE_RUNS_COMMAND_ID } from '@/object-core/commands/constants/CoreAgentsSeeRunsCommandId';
import { isMatchingSidePanelSearch } from '@/object-core/commands/utils/isMatchingSidePanelSearch';
import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { sidePanelSearchState } from '@/side-panel/states/sidePanelSearchState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { FeatureFlagKey } from '~/generated-metadata/graphql';

export const useCoreAgentsSelectionCommands = () => {
  const { t } = useLingui();
  const { isInPreviewMode } = useContext(CommandMenuContext);
  const sidePanelSearch = useAtomStateValue(sidePanelSearchState);
  const isAiChatInboxEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_AI_CHAT_INBOX_ENABLED,
  );
  const canManageCoreAgents = useHasPermissionFlag(
    PermissionFlagType.AI_SETTINGS,
  );
  const selectedCoreAgentIds = useSelectedCoreAgentIds();

  const seeRunsCommandLabel = t`See Runs`;
  const shouldDisplaySeeRunsCommand =
    selectedCoreAgentIds.length === 1 &&
    isAiChatInboxEnabled &&
    !isInPreviewMode &&
    isMatchingSidePanelSearch({ label: seeRunsCommandLabel, sidePanelSearch });

  const deleteCommandLabel =
    selectedCoreAgentIds.length === 1 ? t`Delete Agent` : t`Delete Agents`;
  const shouldDisplayDeleteCommand =
    isNonEmptyArray(selectedCoreAgentIds) &&
    !isInPreviewMode &&
    canManageCoreAgents &&
    isMatchingSidePanelSearch({ label: deleteCommandLabel, sidePanelSearch });

  return {
    selectedCoreAgentIds,
    seeRunsCommandLabel,
    shouldDisplaySeeRunsCommand,
    deleteCommandLabel,
    shouldDisplayDeleteCommand,
    coreAgentsSelectionCommandIds: [
      ...(shouldDisplaySeeRunsCommand ? [CORE_AGENTS_SEE_RUNS_COMMAND_ID] : []),
      ...(shouldDisplayDeleteCommand ? [CORE_AGENTS_DELETE_COMMAND_ID] : []),
    ],
  };
};
