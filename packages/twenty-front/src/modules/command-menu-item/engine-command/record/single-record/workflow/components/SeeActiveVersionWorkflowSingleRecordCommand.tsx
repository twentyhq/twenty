import {
  AppPath,
  CoreObjectNameSingular,
  FeatureFlagKey,
} from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

import { HeadlessEngineCommandWrapperEffect } from '@/command-menu-item/engine-command/components/HeadlessEngineCommandWrapperEffect';
import { HeadlessNavigateEngineCommand } from '@/command-menu-item/engine-command/components/HeadlessNavigateEngineCommand';
import { useHeadlessCommandContextApi } from '@/command-menu-item/engine-command/hooks/useHeadlessCommandContextApi';
import { useCoreWorkflowVersions } from '@/object-core/workflows/versions/hooks/useCoreWorkflowVersions';
import { useOpenCoreWorkflowVersionSidePanel } from '@/object-core/workflows/versions/hooks/useOpenCoreWorkflowVersionSidePanel';
import { useActiveWorkflowVersion } from '@/workflow/hooks/useActiveWorkflowVersion';
import { useIsFeatureEnabled } from '@/workspace/hooks/useIsFeatureEnabled';
import { CoreWorkflowVersionStatus } from '~/generated/graphql';

const SeeActiveCoreVersionCommand = ({
  workflowId,
}: {
  workflowId: string;
}) => {
  const { coreWorkflowVersions, loading } = useCoreWorkflowVersions(workflowId);
  const { openCoreWorkflowVersionSidePanel } =
    useOpenCoreWorkflowVersionSidePanel();

  const activeCoreWorkflowVersion = coreWorkflowVersions.find(
    (coreWorkflowVersion) =>
      coreWorkflowVersion.status === CoreWorkflowVersionStatus.ACTIVE,
  );

  return (
    <HeadlessEngineCommandWrapperEffect
      ready={!loading}
      execute={() => {
        if (
          !isDefined(activeCoreWorkflowVersion) ||
          !isDefined(activeCoreWorkflowVersion.workspaceWorkflowVersionId)
        ) {
          return;
        }

        openCoreWorkflowVersionSidePanel({
          workspaceWorkflowVersionId:
            activeCoreWorkflowVersion.workspaceWorkflowVersionId,
          pageTitle: activeCoreWorkflowVersion.label,
        });
      }}
    />
  );
};

const SeeActiveWorkspaceVersionCommand = ({
  workflowId,
}: {
  workflowId: string;
}) => {
  const { workflowVersion, loading } = useActiveWorkflowVersion({
    workflowId,
  });

  if (loading) {
    return null;
  }

  return (
    <HeadlessNavigateEngineCommand
      to={AppPath.RecordShowPage}
      params={{
        objectNameSingular: CoreObjectNameSingular.WorkflowVersion,
        objectRecordId: workflowVersion.id,
      }}
    />
  );
};

export const SeeActiveVersionWorkflowSingleRecordCommand = () => {
  const { selectedRecords } = useHeadlessCommandContextApi();
  const isWorkflowCoreIndexPageEnabled = useIsFeatureEnabled(
    FeatureFlagKey.IS_WORKFLOW_CORE_INDEX_PAGE_ENABLED,
  );

  const recordId = selectedRecords[0]?.id;

  if (!isDefined(recordId)) {
    throw new Error('Record ID is required to see active version workflow');
  }

  if (isWorkflowCoreIndexPageEnabled) {
    return <SeeActiveCoreVersionCommand workflowId={recordId} />;
  }

  return <SeeActiveWorkspaceVersionCommand workflowId={recordId} />;
};
