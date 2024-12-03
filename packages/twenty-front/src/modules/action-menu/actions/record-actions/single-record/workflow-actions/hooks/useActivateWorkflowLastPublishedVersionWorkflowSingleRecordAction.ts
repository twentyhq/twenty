import { useActionMenuEntries } from '@/action-menu/hooks/useActionMenuEntries';
import {
  ActionMenuEntryScope,
  ActionMenuEntryType,
} from '@/action-menu/types/ActionMenuEntry';
import { useActivateWorkflowVersion } from '@/workflow/hooks/useActivateWorkflowVersion';
import { useWorkflowWithCurrentVersion } from '@/workflow/hooks/useWorkflowWithCurrentVersion';
import { IconPower, isDefined } from 'twenty-ui';

export const useActivateWorkflowLastPublishedVersionWorkflowSingleRecordAction =
  ({ workflowId }: { workflowId: string }) => {
    const { addActionMenuEntry, removeActionMenuEntry } =
      useActionMenuEntries();

    const { activateWorkflowVersion } = useActivateWorkflowVersion();

    const workflowWithCurrentVersion =
      useWorkflowWithCurrentVersion(workflowId);

    const registerActivateWorkflowLastPublishedVersionWorkflowSingleRecordAction =
      ({ position }: { position: number }) => {
        if (
          !isDefined(workflowWithCurrentVersion) ||
          !isDefined(workflowWithCurrentVersion.currentVersion.trigger) ||
          !isDefined(workflowWithCurrentVersion.lastPublishedVersionId) ||
          workflowWithCurrentVersion.currentVersion.status === 'ACTIVE' ||
          !isDefined(workflowWithCurrentVersion.currentVersion?.steps) ||
          workflowWithCurrentVersion.currentVersion?.steps.length === 0
        ) {
          return;
        }

        addActionMenuEntry({
          key: 'activate-workflow-last-published-version-single-record',
          label: 'Activate last published version',
          position,
          Icon: IconPower,
          type: ActionMenuEntryType.Standard,
          scope: ActionMenuEntryScope.RecordSelection,
          onClick: () => {
            activateWorkflowVersion({
              workflowVersionId:
                workflowWithCurrentVersion.lastPublishedVersionId,
              workflowId: workflowWithCurrentVersion.id,
            });
          },
        });
      };

    const unregisterActivateWorkflowLastPublishedVersionWorkflowSingleRecordAction =
      () => {
        removeActionMenuEntry(
          'activate-workflow-last-published-version-single-record',
        );
      };

    return {
      registerActivateWorkflowLastPublishedVersionWorkflowSingleRecordAction,
      unregisterActivateWorkflowLastPublishedVersionWorkflowSingleRecordAction,
    };
  };
