import { useActionMenuEntries } from '@/action-menu/hooks/useActionMenuEntries';
import {
  ActionMenuEntryScope,
  ActionMenuEntryType,
} from '@/action-menu/types/ActionMenuEntry';
import { CoreObjectNamePlural } from '@/object-metadata/types/CoreObjectNamePlural';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { FilterQueryParams } from '@/views/hooks/internal/useViewFromQueryParams';
import { ViewFilterOperand } from '@/views/types/ViewFilterOperand';
import { useWorkflowWithCurrentVersion } from '@/workflow/hooks/useWorkflowWithCurrentVersion';
import qs from 'qs';
import { useNavigate } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { IconHistoryToggle, isDefined } from 'twenty-ui';

export const useSeeWorkflowExecutionsWorkflowVersionSingleRecordAction = ({
  workflowVersionId,
}: {
  workflowVersionId: string;
}) => {
  const { addActionMenuEntry, removeActionMenuEntry } = useActionMenuEntries();

  const workflowVersion = useRecoilValue(
    recordStoreFamilyState(workflowVersionId),
  );

  const workflowWithCurrentVersion = useWorkflowWithCurrentVersion(
    workflowVersion?.workflow.id,
  );

  const navigate = useNavigate();

  const registerSeeWorkflowExecutionsWorkflowVersionSingleRecordAction = ({
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
        workflowVersion: {
          [ViewFilterOperand.Is]: [workflowVersionId],
        },
      },
    };
    const filterLinkHref = `/objects/${CoreObjectNamePlural.WorkflowRun}?${qs.stringify(
      filterQueryParams,
    )}`;

    addActionMenuEntry({
      key: 'see-workflow-executions-single-record',
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

  const unregisterSeeWorkflowExecutionsWorkflowVersionSingleRecordAction =
    () => {
      removeActionMenuEntry('see-workflow-executions-single-record');
    };

  return {
    registerSeeWorkflowExecutionsWorkflowVersionSingleRecordAction,
    unregisterSeeWorkflowExecutionsWorkflowVersionSingleRecordAction,
  };
};
