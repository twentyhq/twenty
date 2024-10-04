import { Button } from '@/ui/input/button/components/Button';
import { useActivateWorkflowVersion } from '@/workflow/hooks/useActivateWorkflowVersion';
import { useDeactivateWorkflowVersion } from '@/workflow/hooks/useDeactivateWorkflowVersion';
import { useWorkflowVersion } from '@/workflow/hooks/useWorkflowVersion';
import { IconPencil, IconPlayerStop, IconPower, isDefined } from 'twenty-ui';

export const RecordShowPageWorkflowVersionHeader = ({
  workflowVersionId,
}: {
  workflowVersionId: string;
}) => {
  const workflowVersion = useWorkflowVersion(workflowVersionId);

  const hasAlreadyDraftVersion =
    workflowVersion?.workflow.statuses?.includes('DRAFT') ?? false;

  const isWaitingForWorkflowVersion = !isDefined(workflowVersion);

  const { activateWorkflowVersion } = useActivateWorkflowVersion();
  const { deactivateWorkflowVersion } = useDeactivateWorkflowVersion();

  return (
    <>
      {workflowVersion?.status !== 'DRAFT' ? (
        <Button
          title={`Use as Draft${hasAlreadyDraftVersion ? ' (override)' : ''}`}
          variant="secondary"
          Icon={IconPencil}
          disabled={isWaitingForWorkflowVersion}
          onClick={() => {
            // return activateWorkflowVersion(workflowVersion.id);
          }}
        />
      ) : null}

      {workflowVersion?.status === 'DRAFT' ||
      workflowVersion?.status === 'DEACTIVATED' ? (
        <Button
          title="Activate"
          variant="secondary"
          Icon={IconPower}
          disabled={isWaitingForWorkflowVersion}
          onClick={() => {
            return activateWorkflowVersion(workflowVersion.id);
          }}
        />
      ) : workflowVersion?.status === 'ACTIVE' ? (
        <Button
          title="Deactivate"
          variant="secondary"
          Icon={IconPlayerStop}
          disabled={isWaitingForWorkflowVersion}
          onClick={() => {
            return deactivateWorkflowVersion(workflowVersion.id);
          }}
        />
      ) : null}
    </>
  );
};
