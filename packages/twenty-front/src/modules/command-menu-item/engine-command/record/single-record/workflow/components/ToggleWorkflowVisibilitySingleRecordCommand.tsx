import { HeadlessEngineCommandWrapperEffect } from '@/command-menu-item/engine-command/components/HeadlessEngineCommandWrapperEffect';
import { useHeadlessCommandContextApi } from '@/command-menu-item/engine-command/hooks/useHeadlessCommandContextApi';
import { useCoreWorkflowsWithCurrentVersions } from '@/command-menu-item/hooks/useCoreWorkflowsWithCurrentVersions';
import { useUpdateCoreWorkflowVisibility } from '@/object-core/workflows/hooks/useUpdateCoreWorkflowVisibility';
import { isDefined } from 'twenty-shared/utils';
import { WorkflowVisibility } from '~/generated/graphql';

export const ToggleWorkflowVisibilitySingleRecordCommand = () => {
  const { selectedRecords } = useHeadlessCommandContextApi();

  const recordId = selectedRecords[0]?.id;
  const [coreWorkflow] = useCoreWorkflowsWithCurrentVersions(
    isDefined(recordId) ? [recordId] : [],
  );
  const { updateVisibility } = useUpdateCoreWorkflowVisibility({
    coreWorkflowId: recordId ?? '',
  });

  if (!isDefined(recordId)) {
    throw new Error('Record ID is required to change workflow visibility');
  }

  const handleExecute = () => {
    if (!isDefined(coreWorkflow)) {
      return;
    }

    return updateVisibility(
      coreWorkflow.visibility === WorkflowVisibility.PRIVATE
        ? WorkflowVisibility.WORKSPACE
        : WorkflowVisibility.PRIVATE,
    );
  };

  return (
    <HeadlessEngineCommandWrapperEffect
      execute={handleExecute}
      ready={isDefined(coreWorkflow)}
    />
  );
};
