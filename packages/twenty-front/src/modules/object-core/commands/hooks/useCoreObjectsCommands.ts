import { useLingui } from '@lingui/react/macro';
import { useContext } from 'react';
import { useLocation } from 'react-router-dom';
import { AppPath, FeatureFlagKey } from 'twenty-shared/types';

import { CommandMenuContext } from '@/command-menu-item/contexts/CommandMenuContext';
import { CORE_WORKFLOW_FILTERS_COMMAND_ID } from '@/object-core/commands/constants/CoreWorkflowFiltersCommandId';
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

  const isOnCoreWorkflowsIndex =
    isMatchingLocation(location, AppPath.WorkflowCoreIndexPage) ||
    (isWorkflowCoreIndexPageEnabled &&
      isMatchingLocation(location, '/objects/workflows'));

  const coreWorkflowFiltersCommandLabel = t`Filter workflows`;

  const shouldDisplayCoreWorkflowFiltersCommand =
    isOnCoreWorkflowsIndex &&
    !isInPreviewMode &&
    normalizeSearchText(coreWorkflowFiltersCommandLabel).includes(
      normalizeSearchText(sidePanelSearch.trim()),
    );

  const coreObjectsCommandIds = shouldDisplayCoreWorkflowFiltersCommand
    ? [CORE_WORKFLOW_FILTERS_COMMAND_ID]
    : [];

  return {
    coreObjectsCommandIds,
    coreWorkflowFiltersCommandLabel,
    shouldDisplayCoreWorkflowFiltersCommand,
  };
};
