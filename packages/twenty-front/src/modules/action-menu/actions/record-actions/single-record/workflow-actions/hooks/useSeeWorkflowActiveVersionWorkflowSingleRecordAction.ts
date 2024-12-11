import { WORKFLOW_SINGLE_RECORD_ACTIONS_CONFIG } from '@/action-menu/actions/record-actions/single-record/workflow-actions/constants/WorkflowSingleRecordActionsConfig';
import { useActionMenuEntries } from '@/action-menu/hooks/useActionMenuEntries';

import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { useActiveWorkflowVersion } from '@/workflow/hooks/useActiveWorkflowVersion';
import { useNavigate } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { isDefined } from 'twenty-ui';

export const useSeeWorkflowActiveVersionWorkflowSingleRecordAction = ({
  workflowId,
}: {
  workflowId: string;
}) => {
  const { addActionMenuEntry } = useActionMenuEntries();

  const workflow = useRecoilValue(recordStoreFamilyState(workflowId));

  const isDraft = workflow?.statuses?.includes('DRAFT');

  const workflowActiveVersion = useActiveWorkflowVersion(workflowId);

  const navigate = useNavigate();

  const registerSeeWorkflowActiveVersionWorkflowSingleRecordAction = () => {
    if (!isDefined(workflowActiveVersion) || !isDraft) {
      return;
    }

    addActionMenuEntry({
      ...WORKFLOW_SINGLE_RECORD_ACTIONS_CONFIG.seeWorkflowActiveVersionSingleRecord,
      onClick: () => {
        navigate(
          `/object/${CoreObjectNameSingular.WorkflowVersion}/${workflowActiveVersion.id}`,
        );
      },
    });
  };

  return {
    registerSeeWorkflowActiveVersionWorkflowSingleRecordAction,
  };
};
