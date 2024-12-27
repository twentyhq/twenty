import { SingleRecordActionHookWithoutObjectMetadataItem } from '@/action-menu/actions/types/SingleRecordActionHook';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { useActiveWorkflowVersion } from '@/workflow/hooks/useActiveWorkflowVersion';
import { useWorkflowWithCurrentVersion } from '@/workflow/hooks/useWorkflowWithCurrentVersion';
import { useNavigate } from 'react-router-dom';
import { isDefined } from 'twenty-ui';

export const useSeeActiveVersionWorkflowSingleRecordAction: SingleRecordActionHookWithoutObjectMetadataItem =
  ({ recordId }) => {
    const workflow = useWorkflowWithCurrentVersion(recordId);

    const isDraft = workflow?.statuses?.includes('DRAFT') || false;

    const workflowActiveVersion = useActiveWorkflowVersion(recordId);

    const navigate = useNavigate();

    const shouldBeRegistered = isDefined(workflowActiveVersion) && isDraft;

    const onClick = () => {
      if (!shouldBeRegistered) {
        return;
      }

      navigate(
        `/object/${CoreObjectNameSingular.WorkflowVersion}/${workflowActiveVersion.id}`,
      );
    };

    return {
      shouldBeRegistered,
      onClick,
    };
  };
