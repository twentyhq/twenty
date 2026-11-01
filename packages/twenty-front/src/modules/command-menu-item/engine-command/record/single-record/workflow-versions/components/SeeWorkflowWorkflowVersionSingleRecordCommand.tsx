import { HeadlessNavigateEngineCommand } from '@/command-menu-item/engine-command/components/HeadlessNavigateEngineCommand';
import { useHeadlessCommandContextApi } from '@/command-menu-item/engine-command/hooks/useHeadlessCommandContextApi';
import { useCoreWorkflowVersion } from '@/object-core/workflows/versions/hooks/useCoreWorkflowVersion';
import { AppPath } from 'twenty-shared/types';
import { isDefined } from 'twenty-shared/utils';

export const SeeWorkflowWorkflowVersionSingleRecordCommand = () => {
  const { selectedRecords } = useHeadlessCommandContextApi();
  const { coreWorkflowVersion } = useCoreWorkflowVersion(
    selectedRecords[0]?.coreWorkflowVersionId,
  );
  const coreWorkflowId = coreWorkflowVersion?.coreWorkflowId;

  return isDefined(coreWorkflowId) ? (
    <HeadlessNavigateEngineCommand
      to={AppPath.WorkflowCoreShowPage}
      params={{ coreWorkflowId }}
    />
  ) : null;
};
