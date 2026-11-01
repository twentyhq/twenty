import { HeadlessEngineCommandWrapperEffect } from '@/command-menu-item/engine-command/components/HeadlessEngineCommandWrapperEffect';
import { useOpenCoreWorkflowVersionsSidePanel } from '@/object-core/workflows/versions/hooks/useOpenCoreWorkflowVersionsSidePanel';
import { useHeadlessCommandContextApi } from '@/command-menu-item/engine-command/hooks/useHeadlessCommandContextApi';
import { useCoreWorkflowVersion } from '@/object-core/workflows/versions/hooks/useCoreWorkflowVersion';
import { isDefined } from 'twenty-shared/utils';

export const SeeVersionsWorkflowVersionSingleRecordCommand = () => {
  const { selectedRecords } = useHeadlessCommandContextApi();
  const { openCoreWorkflowVersionsSidePanel } =
    useOpenCoreWorkflowVersionsSidePanel();
  const { coreWorkflowVersion } = useCoreWorkflowVersion(
    selectedRecords[0]?.coreWorkflowVersionId,
  );
  const workflowId = coreWorkflowVersion?.coreWorkflowId;

  return isDefined(workflowId) ? (
    <HeadlessEngineCommandWrapperEffect
      execute={() => openCoreWorkflowVersionsSidePanel(workflowId)}
    />
  ) : null;
};
