import { useLingui } from '@lingui/react/macro';
import { useContext } from 'react';
import {
  ContextStorePageType,
  CoreObjectNameSingular,
} from 'twenty-shared/types';
import { isNonEmptyArray } from 'twenty-shared/utils';

import { CommandMenuContext } from '@/command-menu-item/contexts/CommandMenuContext';
import { getSelectedRecordsCountLabel } from '@/command-menu-item/utils/getSelectedRecordsCountLabel';
import { useCoreAgentCommands } from '@/object-core/commands/hooks/useCoreAgentCommands';
import { useCoreAgentEditionCommands } from '@/object-core/commands/hooks/useCoreAgentEditionCommands';
import { CORE_WORKFLOWS_DELETE_COMMAND_ID } from '@/object-core/commands/constants/CoreWorkflowsDeleteCommandId';
import { CORE_WORKFLOW_FILTERS_COMMAND_ID } from '@/object-core/commands/constants/CoreWorkflowFiltersCommandId';
import { isMatchingSidePanelSearch } from '@/object-core/commands/utils/isMatchingSidePanelSearch';
import { coreWorkflowsFilterSettingsState } from '@/object-core/workflows/states/coreWorkflowsFilterSettingsState';
import { coreWorkflowsSelectionState } from '@/object-core/workflows/states/coreWorkflowsSelectionState';
import { getSelectedCoreWorkflowRowIds } from '@/object-core/workflows/utils/getSelectedCoreWorkflowRowIds';
import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { PermissionFlagType } from 'twenty-shared/constants';
import { sidePanelSearchState } from '@/side-panel/states/sidePanelSearchState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';

export const useCoreObjectsCommands = () => {
  const { t } = useLingui();
  const { isInPreviewMode, commandMenuContextApi } =
    useContext(CommandMenuContext);
  const sidePanelSearch = useAtomStateValue(sidePanelSearchState);

  const canManageWorkflows = useHasPermissionFlag(PermissionFlagType.WORKFLOWS);

  const coreWorkflowsSelection = useAtomStateValue(coreWorkflowsSelectionState);
  const coreWorkflowsFilterSettings = useAtomStateValue(
    coreWorkflowsFilterSettingsState,
  );

  const { coreAgentEditionCommandIds } = useCoreAgentEditionCommands();
  const {
    coreAgentsIndexCommandIds,
    coreAgentSelectionCommandIds,
    coreAgentsObjectSectionContext,
    coreAgentSelectionSectionContext,
  } = useCoreAgentCommands();

  const selectedCoreWorkflowIds = getSelectedCoreWorkflowRowIds({
    selection: coreWorkflowsSelection,
    currentFilterSettings: coreWorkflowsFilterSettings,
  });

  const isOnCoreWorkflowsIndex =
    commandMenuContextApi.pageType === ContextStorePageType.Index &&
    commandMenuContextApi.objectMetadataItem.nameSingular ===
      CoreObjectNameSingular.Workflow;

  const matchesSidePanelSearch = (label: string) =>
    isMatchingSidePanelSearch({ label, sidePanelSearch });

  const coreWorkflowFiltersCommandLabel = t`Filter workflows`;

  const shouldDisplayCoreWorkflowFiltersCommand =
    isOnCoreWorkflowsIndex &&
    !isInPreviewMode &&
    matchesSidePanelSearch(coreWorkflowFiltersCommandLabel);

  const coreWorkflowsDeleteCommandLabel =
    selectedCoreWorkflowIds.length === 1
      ? t`Delete Workflow`
      : t`Delete Workflows`;

  const shouldDisplayCoreWorkflowsDeleteCommand =
    isOnCoreWorkflowsIndex &&
    !isInPreviewMode &&
    isNonEmptyArray(selectedCoreWorkflowIds) &&
    canManageWorkflows &&
    matchesSidePanelSearch(coreWorkflowsDeleteCommandLabel);

  const coreObjectCommandIds = [
    ...(shouldDisplayCoreWorkflowFiltersCommand
      ? [CORE_WORKFLOW_FILTERS_COMMAND_ID]
      : []),
    ...coreAgentsIndexCommandIds,
  ];

  const coreSelectionCommandIds = [
    ...(shouldDisplayCoreWorkflowsDeleteCommand
      ? [CORE_WORKFLOWS_DELETE_COMMAND_ID]
      : []),
    ...coreAgentEditionCommandIds,
    ...coreAgentSelectionCommandIds,
  ];

  const coreSelectionSectionContext =
    isOnCoreWorkflowsIndex && isNonEmptyArray(selectedCoreWorkflowIds)
      ? {
          label: getSelectedRecordsCountLabel({
            objectMetadataItem: {
              labelSingular: t`Workflow`,
              labelPlural: t`Workflows`,
            },
            numberOfSelectedRecords: selectedCoreWorkflowIds.length,
          }),
        }
      : coreAgentSelectionSectionContext;

  return {
    coreObjectCommandIds,
    coreObjectSectionContext: coreAgentsObjectSectionContext,
    coreSelectionCommandIds,
    coreSelectionSectionContext,
    coreWorkflowFiltersCommandLabel,
    shouldDisplayCoreWorkflowFiltersCommand,
    coreWorkflowsDeleteCommandLabel,
    shouldDisplayCoreWorkflowsDeleteCommand,
  };
};
