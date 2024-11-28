import { useActionMenuEntries } from '@/action-menu/hooks/useActionMenuEntries';
import {
  ActionMenuEntryScope,
  ActionMenuEntryType,
} from '@/action-menu/types/ActionMenuEntry';
import { CoreObjectNamePlural } from '@/object-metadata/types/CoreObjectNamePlural';
import { FilterQueryParams } from '@/views/hooks/internal/useViewFromQueryParams';
import { ViewFilterOperand } from '@/views/types/ViewFilterOperand';
import { useWorkflowWithCurrentVersion } from '@/workflow/hooks/useWorkflowWithCurrentVersion';
import qs from 'qs';
import { useNavigate } from 'react-router-dom';
import { IconHistoryToggle, isDefined } from 'twenty-ui';

export const useSeeWorkflowExecutionsSingleRecordAction = ({
  workflowId,
}: {
  workflowId: string;
}) => {
  const { addActionMenuEntry, removeActionMenuEntry } = useActionMenuEntries();

  const workflowWithCurrentVersion = useWorkflowWithCurrentVersion(workflowId);

  const navigate = useNavigate();

  const registerSeeWorkflowExecutionsSingleRecordAction = ({
    position,
  }: {
    position: number;
  }) => {
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
    const filterLinkHref = `/objects/${CoreObjectNamePlural.WorkflowRun}?${qs.stringify(
      filterQueryParams,
    )}`;

    addActionMenuEntry({
      key: 'see-workflow-executions',
      label: 'See executions',
      position,
      type: ActionMenuEntryType.Standard,
      scope: ActionMenuEntryScope.RecordSelection,
      Icon: IconHistoryToggle,
      onClick: () => {
        navigate(filterLinkHref);
      },
    });
  };

  const unregisterSeeWorkflowExecutionsSingleRecordAction = () => {
    removeActionMenuEntry('see-workflow-executions');
  };

  return {
    registerSeeWorkflowExecutionsSingleRecordAction,
    unregisterSeeWorkflowExecutionsSingleRecordAction,
  };
};
