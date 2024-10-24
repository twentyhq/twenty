import { Button } from '@/ui/input/button/components/Button';
import { useActivateWorkflowVersion } from '@/workflow/hooks/useActivateWorkflowVersion';
import { useDeactivateWorkflowVersion } from '@/workflow/hooks/useDeactivateWorkflowVersion';
import { useDeleteOneWorkflowVersion } from '@/workflow/hooks/useDeleteOneWorkflowVersion';
import { useWorkflowWithCurrentVersion } from '@/workflow/hooks/useWorkflowWithCurrentVersion';
import {
  IconPlayerPlay,
  IconPlayerStop,
  IconPower,
  IconTrash,
  isDefined,
} from 'twenty-ui';
import { assertWorkflowWithCurrentVersionIsDefined } from '../utils/assertWorkflowWithCurrentVersionIsDefined';

export const RecordShowPageWorkflowHeader = ({
  workflowId,
}: {
  workflowId: string;
}) => {
  const workflowWithCurrentVersion = useWorkflowWithCurrentVersion(workflowId);

  const isWaitingForWorkflowWithCurrentVersion =
    !isDefined(workflowWithCurrentVersion) ||
    !isDefined(workflowWithCurrentVersion.currentVersion);

  const { activateWorkflowVersion } = useActivateWorkflowVersion();
  const { deactivateWorkflowVersion } = useDeactivateWorkflowVersion();
  const { deleteOneWorkflowVersion } = useDeleteOneWorkflowVersion();

  return (
    <>
      <Button
        title="Test"
        variant="secondary"
        Icon={IconPlayerPlay}
        disabled={isWaitingForWorkflowWithCurrentVersion}
        onClick={() => {}}
      />

      {workflowWithCurrentVersion?.currentVersion?.status === 'DRAFT' &&
      workflowWithCurrentVersion.versions?.length > 1 ? (
        <Button
          title="Discard Draft"
          variant="secondary"
          Icon={IconTrash}
          disabled={isWaitingForWorkflowWithCurrentVersion}
          onClick={() => {
            assertWorkflowWithCurrentVersionIsDefined(
              workflowWithCurrentVersion,
            );

            return deleteOneWorkflowVersion({
              workflowVersionId: workflowWithCurrentVersion.currentVersion.id,
            });
          }}
        />
      ) : null}

      {workflowWithCurrentVersion?.currentVersion?.status === 'DRAFT' ||
      workflowWithCurrentVersion?.currentVersion?.status === 'DEACTIVATED' ? (
        <Button
          title="Activate"
          variant="secondary"
          Icon={IconPower}
          disabled={isWaitingForWorkflowWithCurrentVersion}
          onClick={() => {
            assertWorkflowWithCurrentVersionIsDefined(
              workflowWithCurrentVersion,
            );

            return activateWorkflowVersion({
              workflowVersionId: workflowWithCurrentVersion.currentVersion.id,
              workflowId: workflowWithCurrentVersion.id,
            });
          }}
        />
      ) : workflowWithCurrentVersion?.currentVersion?.status === 'ACTIVE' ? (
        <Button
          title="Deactivate"
          variant="secondary"
          Icon={IconPlayerStop}
          disabled={isWaitingForWorkflowWithCurrentVersion}
          onClick={() => {
            assertWorkflowWithCurrentVersionIsDefined(
              workflowWithCurrentVersion,
            );

            return deactivateWorkflowVersion(
              workflowWithCurrentVersion.currentVersion.id,
            );
          }}
        />
      ) : null}
    </>
  );
};
