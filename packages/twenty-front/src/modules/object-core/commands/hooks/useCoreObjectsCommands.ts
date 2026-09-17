import { useLingui } from '@lingui/react/macro';
import { useContext } from 'react';
import {
  ContextStorePageType,
  CoreObjectNameSingular,
  FeatureFlagKey,
} from 'twenty-shared/types';
import { isNonEmptyArray } from 'twenty-shared/utils';

import { CommandMenuContext } from '@/command-menu-item/contexts/CommandMenuContext';
import { CORE_WORKFLOWS_DELETE_COMMAND_ID } from '@/object-core/commands/constants/CoreWorkflowsDeleteCommandId';
import { CORE_WORKFLOW_FILTERS_COMMAND_ID } from '@/object-core/commands/constants/CoreWorkflowFiltersCommandId';
import { coreWorkflowsFilterSettingsState } from '@/object-core/workflows/states/coreWorkflowsFilterSettingsState';
import { coreWorkflowsSelectionState } from '@/object-core/workflows/states/coreWorkflowsSelectionState';
import { getSelectedCoreWorkflowRowIds } from '@/object-core/workflows/utils/getSelectedCoreWorkflowRowIds';
import { useHasPermissionFlag } from '@/settings/roles/hooks/useHasPermissionFlag';
import { PermissionFlagType } from 'twenty-shared/constants';
import { sidePanelSearchState } from '@/side-panel/states/sidePanelSearchState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { normalizeSearchText } from '~/utils/normalizeSearchText';

export const useCoreObjectsCommands = () => {
  const { t } = useLingui();
  const { isInPreviewMode, commandMenuContextApi } =
    useContext(CommandMenuContext);
  const sidePanelSearch = useAtomStateValue(sidePanelSearchState);

  const isWorkflowCoreIndexPageEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_WORKFLOW_CORE_INDEX_PAGE_ENABLED,
  );

  const canManageWorkflows = useHasPermissionFlag(PermissionFlagType.WORKFLOWS);

  const coreWorkflowsSelection = useAtomStateValue(coreWorkflowsSelectionState);
  const coreWorkflowsFilterSettings = useAtomStateValue(
    coreWorkflowsFilterSettingsState,
  );

  const selectedCoreWorkflowIds = getSelectedCoreWorkflowRowIds({
    selection: coreWorkflowsSelection,
    currentFilterSettings: coreWorkflowsFilterSettings,
  });

  const isOnCoreWorkflowsIndex =
    isWorkflowCoreIndexPageEnabled &&
    commandMenuContextApi.pageType === ContextStorePageType.Index &&
    commandMenuContextApi.objectMetadataItem.nameSingular ===
      CoreObjectNameSingular.Workflow;

  const matchesSidePanelSearch = (label: string) =>
    normalizeSearchText(label).includes(
      normalizeSearchText(sidePanelSearch.trim()),
    );

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

  const coreObjectsCommandIds = [
    ...(shouldDisplayCoreWorkflowFiltersCommand
      ? [CORE_WORKFLOW_FILTERS_COMMAND_ID]
      : []),
    ...(shouldDisplayCoreWorkflowsDeleteCommand
      ? [CORE_WORKFLOWS_DELETE_COMMAND_ID]
      : []),
  ];

  return {
    coreObjectsCommandIds,
    coreWorkflowFiltersCommandLabel,
    shouldDisplayCoreWorkflowFiltersCommand,
    coreWorkflowsDeleteCommandLabel,
    shouldDisplayCoreWorkflowsDeleteCommand,
  };
};
