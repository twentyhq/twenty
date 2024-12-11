import { WORKFLOW_SINGLE_RECORD_ACTIONS_CONFIG } from '@/action-menu/actions/record-actions/single-record/workflow-actions/constants/WorkflowSingleRecordActionsConfig';
import { useActionMenuEntries } from '@/action-menu/hooks/useActionMenuEntries';

import { CoreObjectNamePlural } from '@/object-metadata/types/CoreObjectNamePlural';
import { FilterQueryParams } from '@/views/hooks/internal/useViewFromQueryParams';
import { ViewFilterOperand } from '@/views/types/ViewFilterOperand';
import { useWorkflowWithCurrentVersion } from '@/workflow/hooks/useWorkflowWithCurrentVersion';
import qs from 'qs';
import { useNavigate } from 'react-router-dom';
import { isDefined } from 'twenty-ui';

export const useSeeWorkflowVersionsHistoryWorkflowSingleRecordAction = ({
  workflowId,
}: {
  workflowId: string;
}) => {
  const { addActionMenuEntry } = useActionMenuEntries();

  const workflowWithCurrentVersion = useWorkflowWithCurrentVersion(workflowId);

  const navigate = useNavigate();

  const registerSeeWorkflowVersionsHistoryWorkflowSingleRecordAction = () => {
    if (!isDefined(workflowWithCurrentVersion)) {
      return;
    }

    const filterQueryParams: FilterQueryParams = {
      filter: {
        workflow: {
          [ViewFilterOperand.Is]: [workflowWithCurrentVersion.id],
        },
      },
    };
    const filterLinkHref = `/objects/${CoreObjectNamePlural.WorkflowVersion}?${qs.stringify(
      filterQueryParams,
    )}`;

    addActionMenuEntry({
      ...WORKFLOW_SINGLE_RECORD_ACTIONS_CONFIG.seeWorkflowVersionsHistorySingleRecord,
      onClick: () => {
        navigate(filterLinkHref);
      },
    });
  };

  return {
    registerSeeWorkflowVersionsHistoryWorkflowSingleRecordAction,
  };
};
