import { Action } from '@/action-menu/actions/components/Action';
import { useSelectedRecordIdOrThrow } from '@/action-menu/actions/record-actions/single-record/hooks/useSelectedRecordIdOrThrow';
import { useWorkflowWithCurrentVersion } from '@/workflow/hooks/useWorkflowWithCurrentVersion';
import { getWorkflowVersionDiagram } from '@/workflow/workflow-diagram/utils/getWorkflowVersionDiagram';
import { useTidyUpWorkflowVersion } from '@/workflow/workflow-version/hooks/useTidyUpWorkflowVersion';
import { isDefined } from 'twenty-shared/utils';

export const TidyUpWorkflowSingleRecordAction = () => {
  const recordId = useSelectedRecordIdOrThrow();
  const workflowWithCurrentVersion = useWorkflowWithCurrentVersion(recordId);
  const { tidyUpWorkflowVersion } = useTidyUpWorkflowVersion();

  const onClick = () => {
    if (!isDefined(workflowWithCurrentVersion?.currentVersion)) {
      return;
    }

    const workflowDiagram = getWorkflowVersionDiagram({
      workflowVersion: workflowWithCurrentVersion.currentVersion,
      workflowContext: 'workflow-version',
    });

    tidyUpWorkflowVersion(workflowDiagram);
  };

  return <Action onClick={onClick} />;
};
