import { useLingui } from '@lingui/react/macro';
import { useContext } from 'react';
import {
  ContextStorePageType,
  CoreObjectNameSingular,
  FeatureFlagKey,
} from 'twenty-shared/types';

import { CommandMenuContext } from '@/command-menu-item/contexts/CommandMenuContext';
import { CORE_WORKFLOW_FILTERS_COMMAND_ID } from '@/object-core/commands/constants/CoreWorkflowFiltersCommandId';
import { sidePanelSearchState } from '@/side-panel/states/sidePanelSearchState';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { normalizeSearchText } from 'twenty-ui/utilities';

export const useCoreObjectsCommands = () => {
  const { t } = useLingui();
  const { isInPreviewMode, commandMenuContextApi } =
    useContext(CommandMenuContext);
  const sidePanelSearch = useAtomStateValue(sidePanelSearchState);

  const isWorkflowCoreIndexPageEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_WORKFLOW_CORE_INDEX_PAGE_ENABLED,
  );

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

  const coreObjectCommandIds = shouldDisplayCoreWorkflowFiltersCommand
    ? [CORE_WORKFLOW_FILTERS_COMMAND_ID]
    : [];

  return {
    coreObjectCommandIds,
    coreWorkflowFiltersCommandLabel,
    shouldDisplayCoreWorkflowFiltersCommand,
  };
};
