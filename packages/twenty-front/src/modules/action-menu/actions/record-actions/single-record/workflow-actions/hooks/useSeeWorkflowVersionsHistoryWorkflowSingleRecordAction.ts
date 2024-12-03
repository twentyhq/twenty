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
import { IconHistory, isDefined } from 'twenty-ui';

export const useSeeWorkflowVersionsHistoryWorkflowSingleRecordAction = ({
  workflowId,
}: {
  workflowId: string;
}) => {
  const { addActionMenuEntry, removeActionMenuEntry } = useActionMenuEntries();

  const workflowWithCurrentVersion = useWorkflowWithCurrentVersion(workflowId);

  const navigate = useNavigate();

  const registerSeeWorkflowVersionsHistoryWorkflowSingleRecordAction = ({
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
    const filterLinkHref = `/objects/${CoreObjectNamePlural.WorkflowVersion}?${qs.stringify(
      filterQueryParams,
    )}`;

    addActionMenuEntry({
      key: 'see-workflow-versions-history-single-record',
      label: 'See versions history',
      position,
      type: ActionMenuEntryType.Standard,
      scope: ActionMenuEntryScope.RecordSelection,
      Icon: IconHistory,
      onClick: () => {
        navigate(filterLinkHref);
      },
    });
  };

  const unregisterSeeWorkflowVersionsHistoryWorkflowSingleRecordAction = () => {
    removeActionMenuEntry('see-workflow-versions-history-single-record');
  };

  return {
    registerSeeWorkflowVersionsHistoryWorkflowSingleRecordAction,
    unregisterSeeWorkflowVersionsHistoryWorkflowSingleRecordAction,
  };
};
