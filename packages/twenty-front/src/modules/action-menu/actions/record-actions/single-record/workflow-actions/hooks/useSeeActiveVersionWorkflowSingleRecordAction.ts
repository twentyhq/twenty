import { useSelectedRecordIdOrThrow } from '@/action-menu/actions/record-actions/single-record/hooks/useSelectedRecordIdOrThrow';
import { ActionHookWithoutObjectMetadataItem } from '@/action-menu/actions/types/ActionHook';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { AppPath } from '@/types/AppPath';
import { useActiveWorkflowVersion } from '@/workflow/hooks/useActiveWorkflowVersion';
import { useWorkflowWithCurrentVersion } from '@/workflow/hooks/useWorkflowWithCurrentVersion';
import { isDefined } from 'twenty-ui';
import { useNavigateApp } from '~/hooks/useNavigateApp';

export const useSeeActiveVersionWorkflowSingleRecordAction: ActionHookWithoutObjectMetadataItem =
  () => {
    const recordId = useSelectedRecordIdOrThrow();

    const workflow = useWorkflowWithCurrentVersion(recordId);

    const isDraft = workflow?.statuses?.includes('DRAFT') || false;

    const workflowActiveVersion = useActiveWorkflowVersion(recordId);

    const navigateApp = useNavigateApp();

    const shouldBeRegistered = isDefined(workflowActiveVersion) && isDraft;

    const onClick = () => {
      if (!shouldBeRegistered) {
        return;
      }

      navigateApp(AppPath.RecordShowPage, {
        objectNameSingular: CoreObjectNameSingular.WorkflowVersion,
        objectRecordId: workflowActiveVersion.id,
      });
    };

    return {
      shouldBeRegistered,
      onClick,
    };
  };
