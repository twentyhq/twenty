import { useLingui } from '@lingui/react/macro';
import { isNonEmptyString } from '@sniptt/guards';
import { useContext } from 'react';
import { matchPath, useLocation } from 'react-router-dom';
import { PermissionFlagType } from 'twenty-shared/constants';
import { AppPath } from 'twenty-shared/types';
import { isDefined, isNonEmptyArray } from 'twenty-shared/utils';
import { useTheme } from 'twenty-ui/theme';

import { type CommandMenuItemSectionContext } from '@/command-menu-item/types/CommandMenuItemSectionContext';
import { CommandMenuContext } from '@/command-menu-item/contexts/CommandMenuContext';
import { getSelectedRecordsCountLabel } from '@/command-menu-item/utils/getSelectedRecordsCountLabel';
import { CoreAgentIcon } from '@/object-core/agents/components/CoreAgentIcon';
import { useCurrentCoreAgent } from '@/object-core/agents/hooks/useCurrentCoreAgent';
import { coreAgentIsRunsViewFamilyState } from '@/object-core/agents/states/coreAgentIsRunsViewFamilyState';
import { coreAgentsFilterSettingsState } from '@/object-core/agents/states/coreAgentsFilterSettingsState';
import { coreAgentsSelectionState } from '@/object-core/agents/states/coreAgentsSelectionState';
import { getSelectedCoreAgentRowIds } from '@/object-core/agents/utils/getSelectedCoreAgentRowIds';
import { CORE_AGENT_DELETE_COMMAND_ID } from '@/object-core/commands/constants/CoreAgentDeleteCommandId';
import { CORE_AGENT_TOGGLE_RUNS_COMMAND_ID } from '@/object-core/commands/constants/CoreAgentToggleRunsCommandId';
import { CORE_AGENTS_CREATE_COMMAND_ID } from '@/object-core/commands/constants/CoreAgentsCreateCommandId';
import { CORE_AGENTS_DELETE_COMMAND_ID } from '@/object-core/commands/constants/CoreAgentsDeleteCommandId';
import { CORE_AGENTS_FILTERS_COMMAND_ID } from '@/object-core/commands/constants/CoreAgentsFiltersCommandId';
import { CORE_AGENTS_SEE_RUNS_COMMAND_ID } from '@/object-core/commands/constants/CoreAgentsSeeRunsCommandId';
import { isMatchingSidePanelSearch } from '@/object-core/commands/utils/isMatchingSidePanelSearch';
import { useGetIsMetadataItemCustom } from '@/object-metadata/hooks/useGetIsMetadataItemCustom';
import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { sidePanelSearchState } from '@/side-panel/states/sidePanelSearchState';
import { useAtomFamilyStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilyStateValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { FeatureFlagKey } from '~/generated-metadata/graphql';

export const useCoreAgentCommands = () => {
  const { t } = useLingui();
  const theme = useTheme();
  const location = useLocation();
  const { isInPreviewMode } = useContext(CommandMenuContext);
  const sidePanelSearch = useAtomStateValue(sidePanelSearchState);
  const isAiChatInboxEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_AI_CHAT_INBOX_ENABLED,
  );
  const canManageCoreAgents = useHasPermissionFlag(
    PermissionFlagType.AI_SETTINGS,
  );

  const getIsMetadataItemCustom = useGetIsMetadataItemCustom();
  const currentCoreAgent = useCurrentCoreAgent();
  const coreAgentIsRunsView = useAtomFamilyStateValue(
    coreAgentIsRunsViewFamilyState,
    currentCoreAgent?.id ?? '',
  );

  const coreAgentsSelection = useAtomStateValue(coreAgentsSelectionState);
  const coreAgentsFilterSettings = useAtomStateValue(
    coreAgentsFilterSettingsState,
  );

  const isOnCoreAgentsIndex = isDefined(
    matchPath(AppPath.AgentIndexPage, location.pathname),
  );

  const selectedCoreAgentIds = isOnCoreAgentsIndex
    ? getSelectedCoreAgentRowIds({
        selection: coreAgentsSelection,
        currentFilterSettings: coreAgentsFilterSettings,
      })
    : [];

  const matchesSidePanelSearch = (label: string) =>
    isMatchingSidePanelSearch({ label, sidePanelSearch });

  const createCommandLabel = t`Create Agent`;
  const shouldDisplayCreateCommand =
    isOnCoreAgentsIndex &&
    !isNonEmptyArray(selectedCoreAgentIds) &&
    !isInPreviewMode &&
    canManageCoreAgents &&
    matchesSidePanelSearch(createCommandLabel);

  const filtersCommandLabel = t`Filter agents`;
  const shouldDisplayFiltersCommand =
    isOnCoreAgentsIndex &&
    !isInPreviewMode &&
    matchesSidePanelSearch(filtersCommandLabel);

  const seeRunsCommandLabel = t`See Runs`;
  const shouldDisplaySeeRunsCommand =
    selectedCoreAgentIds.length === 1 &&
    isAiChatInboxEnabled &&
    !isInPreviewMode &&
    matchesSidePanelSearch(seeRunsCommandLabel);

  const deleteCommandLabel =
    selectedCoreAgentIds.length === 1 ? t`Delete Agent` : t`Delete Agents`;
  const shouldDisplayDeleteCommand =
    isNonEmptyArray(selectedCoreAgentIds) &&
    !isInPreviewMode &&
    canManageCoreAgents &&
    matchesSidePanelSearch(deleteCommandLabel);

  const toggleRunsCommandLabel = coreAgentIsRunsView
    ? t`See Settings`
    : t`See Runs`;
  const shouldDisplayToggleRunsCommand =
    isDefined(currentCoreAgent) &&
    isAiChatInboxEnabled &&
    !isInPreviewMode &&
    matchesSidePanelSearch(toggleRunsCommandLabel);

  const deleteCurrentCommandLabel = t`Delete Agent`;
  const shouldDisplayDeleteCurrentCommand =
    isDefined(currentCoreAgent) &&
    getIsMetadataItemCustom(currentCoreAgent) &&
    !isInPreviewMode &&
    matchesSidePanelSearch(deleteCurrentCommandLabel);

  const coreAgentsObjectSectionContext:
    | CommandMenuItemSectionContext
    | undefined = isOnCoreAgentsIndex
    ? {
        icon: <CoreAgentIcon size={theme.icon.size.md} />,
        label: t`Agents`,
      }
    : undefined;

  const getCoreAgentSelectionSectionContext = ():
    | CommandMenuItemSectionContext
    | undefined => {
    if (isDefined(currentCoreAgent)) {
      return {
        icon: (
          <CoreAgentIcon
            agentId={currentCoreAgent.id}
            avatarColor={currentCoreAgent.avatarColor}
            avatarShape={currentCoreAgent.avatarShape}
            size={theme.icon.size.md}
          />
        ),
        label: isNonEmptyString(currentCoreAgent.label)
          ? currentCoreAgent.label
          : t`Untitled`,
      };
    }

    if (isNonEmptyArray(selectedCoreAgentIds)) {
      return {
        label: getSelectedRecordsCountLabel({
          objectMetadataItem: {
            labelSingular: t`Agent`,
            labelPlural: t`Agents`,
          },
          numberOfSelectedRecords: selectedCoreAgentIds.length,
        }),
      };
    }

    return undefined;
  };

  return {
    currentCoreAgent,
    coreAgentIsRunsView,
    selectedCoreAgentIds,
    createCommandLabel,
    shouldDisplayCreateCommand,
    filtersCommandLabel,
    shouldDisplayFiltersCommand,
    seeRunsCommandLabel,
    shouldDisplaySeeRunsCommand,
    deleteCommandLabel,
    shouldDisplayDeleteCommand,
    toggleRunsCommandLabel,
    shouldDisplayToggleRunsCommand,
    deleteCurrentCommandLabel,
    shouldDisplayDeleteCurrentCommand,
    coreAgentsObjectSectionContext,
    coreAgentSelectionSectionContext: getCoreAgentSelectionSectionContext(),
    coreAgentsIndexCommandIds: [
      ...(shouldDisplayCreateCommand ? [CORE_AGENTS_CREATE_COMMAND_ID] : []),
      ...(shouldDisplayFiltersCommand ? [CORE_AGENTS_FILTERS_COMMAND_ID] : []),
    ],
    coreAgentSelectionCommandIds: [
      ...(shouldDisplayToggleRunsCommand
        ? [CORE_AGENT_TOGGLE_RUNS_COMMAND_ID]
        : []),
      ...(shouldDisplayDeleteCurrentCommand
        ? [CORE_AGENT_DELETE_COMMAND_ID]
        : []),
      ...(shouldDisplaySeeRunsCommand ? [CORE_AGENTS_SEE_RUNS_COMMAND_ID] : []),
      ...(shouldDisplayDeleteCommand ? [CORE_AGENTS_DELETE_COMMAND_ID] : []),
    ],
  };
};
