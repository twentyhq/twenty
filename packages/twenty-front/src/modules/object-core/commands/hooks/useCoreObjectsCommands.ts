import { useLingui } from '@lingui/react/macro';
import { useContext } from 'react';
import { useLocation } from 'react-router-dom';
import {
  AppPath,
  CoreObjectNameSingular,
  FeatureFlagKey,
} from 'twenty-shared/types';
import { isNonEmptyArray } from 'twenty-shared/utils';

import { CommandMenuContext } from '@/command-menu-item/contexts/CommandMenuContext';
import { CoreObjectNamePlural } from '@/object-metadata/types/CoreObjectNamePlural';
import { CORE_WORKFLOWS_DELETE_COMMAND_ID } from '@/object-core/commands/constants/CoreWorkflowsDeleteCommandId';
import { CORE_WORKFLOW_FILTERS_COMMAND_ID } from '@/object-core/commands/constants/CoreWorkflowFiltersCommandId';
import { coreWorkflowsFilterSettingsState } from '@/object-core/workflows/states/coreWorkflowsFilterSettingsState';
import { coreWorkflowsSelectionState } from '@/object-core/workflows/states/coreWorkflowsSelectionState';
import { getSelectedCoreWorkflowRowIds } from '@/object-core/workflows/utils/getSelectedCoreWorkflowRowIds';
import { useObjectMetadataItem } from '@/object-metadata/hooks/useObjectMetadataItem';
import { useObjectPermissionsForObject } from '@/object-record/hooks/useObjectPermissionsForObject';
import { sidePanelSearchState } from '@/side-panel/states/sidePanelSearchState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { isMatchingLocation } from '~/utils/isMatchingLocation';
import { normalizeSearchText } from '~/utils/normalizeSearchText';

export const useCoreObjectsCommands = () => {
  const { t } = useLingui();
  const location = useLocation();
  const { isInPreviewMode } = useContext(CommandMenuContext);
  const sidePanelSearch = useAtomStateValue(sidePanelSearchState);

  const isWorkflowCoreIndexPageEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_WORKFLOW_CORE_INDEX_PAGE_ENABLED,
  );

  const { objectMetadataItem: workflowObjectMetadataItem } =
    useObjectMetadataItem({
      objectNameSingular: CoreObjectNameSingular.Workflow,
    });

  const workflowObjectPermissions = useObjectPermissionsForObject(
    workflowObjectMetadataItem.id,
  );

  const coreWorkflowsSelection = useAtomStateValue(coreWorkflowsSelectionState);
  const coreWorkflowsFilterSettings = useAtomStateValue(
    coreWorkflowsFilterSettingsState,
  );

  const selectedCoreWorkflowIds = getSelectedCoreWorkflowRowIds({
    selection: coreWorkflowsSelection,
    currentFilterSettings: coreWorkflowsFilterSettings,
  });

  const isOnCoreWorkflowsIndex =
    isMatchingLocation(location, AppPath.WorkflowCoreIndexPage) ||
    (isWorkflowCoreIndexPageEnabled &&
      isMatchingLocation(
        location,
        AppPath.RecordIndexPage.replace(
          ':objectNamePlural',
          CoreObjectNamePlural.Workflow,
        ),
      ));

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
    workflowObjectPermissions.canSoftDeleteObjectRecords &&
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
