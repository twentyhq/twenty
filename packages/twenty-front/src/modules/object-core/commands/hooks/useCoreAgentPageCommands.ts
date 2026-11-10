import { useLingui } from '@lingui/react/macro';
import { useContext } from 'react';
import { isDefined } from 'twenty-shared/utils';

import { CommandMenuContext } from '@/command-menu-item/contexts/CommandMenuContext';
import { useCurrentCoreAgent } from '@/object-core/agents/hooks/useCurrentCoreAgent';
import { coreAgentIsRunsViewFamilyState } from '@/object-core/agents/states/coreAgentIsRunsViewFamilyState';
import { CORE_AGENT_DELETE_CURRENT_COMMAND_ID } from '@/object-core/commands/constants/CoreAgentDeleteCurrentCommandId';
import { CORE_AGENT_TOGGLE_RUNS_COMMAND_ID } from '@/object-core/commands/constants/CoreAgentToggleRunsCommandId';
import { isMatchingSidePanelSearch } from '@/object-core/commands/utils/isMatchingSidePanelSearch';
import { useGetIsMetadataItemCustom } from '@/object-metadata/hooks/useGetIsMetadataItemCustom';
import { sidePanelSearchState } from '@/side-panel/states/sidePanelSearchState';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { FeatureFlagKey } from '~/generated-metadata/graphql';

export const useCoreAgentPageCommands = () => {
  const { t } = useLingui();
  const { isInPreviewMode } = useContext(CommandMenuContext);
  const sidePanelSearch = useAtomStateValue(sidePanelSearchState);
  const isAiChatInboxEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_AI_CHAT_INBOX_ENABLED,
  );
  const getIsMetadataItemCustom = useGetIsMetadataItemCustom();
  const currentCoreAgent = useCurrentCoreAgent();
  const coreAgentIsRunsView = useAtomFamilyStateValue(
    coreAgentIsRunsViewFamilyState,
    currentCoreAgent?.id ?? '',
  );

  const toggleRunsCommandLabel = coreAgentIsRunsView
    ? t`See Settings`
    : t`See Runs`;
  const shouldDisplayToggleRunsCommand =
    isDefined(currentCoreAgent) &&
    isAiChatInboxEnabled &&
    !isInPreviewMode &&
    isMatchingSidePanelSearch({
      label: toggleRunsCommandLabel,
      sidePanelSearch,
    });

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
    coreAgentIsRunsView,
    toggleRunsCommandLabel,
    shouldDisplayToggleRunsCommand,
    deleteCurrentCommandLabel,
    shouldDisplayDeleteCurrentCommand,
    coreAgentPageCommandIds: [
      ...(shouldDisplayToggleRunsCommand
        ? [CORE_AGENT_TOGGLE_RUNS_COMMAND_ID]
        : []),
      ...(shouldDisplayDeleteCurrentCommand
        ? [CORE_AGENT_DELETE_CURRENT_COMMAND_ID]
        : []),
    ],
  };
};
