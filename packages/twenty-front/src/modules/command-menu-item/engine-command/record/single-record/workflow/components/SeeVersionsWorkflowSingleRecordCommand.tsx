import {
  AppPath,
  FeatureFlagKey,
  ViewFilterOperand,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { HeadlessEngineCommandWrapperEffect } from '@/command-menu-item/engine-command/components/HeadlessEngineCommandWrapperEffect';
import { HeadlessNavigateEngineCommand } from '@/command-menu-item/engine-command/components/HeadlessNavigateEngineCommand';
import { useHeadlessCommandContextApi } from '@/command-menu-item/engine-command/hooks/useHeadlessCommandContextApi';
import { CoreObjectNamePlural } from '@/object-metadata/types/CoreObjectNamePlural';
import { useOpenCoreWorkflowVersionsSidePanel } from '@/object-core/workflows/versions/hooks/useOpenCoreWorkflowVersionsSidePanel';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';

export const SeeVersionsWorkflowSingleRecordCommand = () => {
  const { selectedRecords } = useHeadlessCommandContextApi();
  const { openCoreWorkflowVersionsSidePanel } =
    useOpenCoreWorkflowVersionsSidePanel();
  const isWorkflowCoreIndexPageEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_WORKFLOW_CORE_INDEX_PAGE_ENABLED,
  );

  const recordId = selectedRecords[0]?.id;

  if (!isDefined(recordId)) {
    throw new Error('Record ID is required to see versions workflow');
  }

  if (isWorkflowCoreIndexPageEnabled) {
    return (
      <HeadlessEngineCommandWrapperEffect
        execute={() => openCoreWorkflowVersionsSidePanel(recordId)}
      />
    );
  }

  return (
    <HeadlessNavigateEngineCommand
      to={AppPath.RecordIndexPage}
      params={{ objectNamePlural: CoreObjectNamePlural.WorkflowVersion }}
      queryParams={{
        filter: {
          workflow: {
            [ViewFilterOperand.IS]: {
              selectedRecordIds: [recordId],
            },
          },
        },
      }}
    />
  );
};
