import { SingleRecordActionHook } from '@/action-menu/actions/types/singleRecordActionHook';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { useActiveWorkflowVersion } from '@/workflow/hooks/useActiveWorkflowVersion';
import { useNavigate } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-ui';

export const useSeeWorkflowActiveVersionWorkflowSingleRecordAction: SingleRecordActionHook =
  (recordId) => {
    const workflow = useRecoilValue(recordStoreFamilyState(recordId));

    const isDraft = workflow?.statuses?.includes('DRAFT');

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
