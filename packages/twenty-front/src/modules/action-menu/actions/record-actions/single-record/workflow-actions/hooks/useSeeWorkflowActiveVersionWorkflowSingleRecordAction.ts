import { useActionMenuEntries } from '@/action-menu/hooks/useActionMenuEntries';
import {
  ActionMenuEntryScope,
  ActionMenuEntryType,
} from '@/action-menu/types/ActionMenuEntry';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { useActiveWorkflowVersion } from '@/workflow/hooks/useActiveWorkflowVersion';
import { useNavigate } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { IconHistory, isDefined } from 'twenty-ui';

export const useSeeWorkflowActiveVersionWorkflowSingleRecordAction = ({
  workflowId,
}: {
  workflowId: string;
}) => {
  const { addActionMenuEntry, removeActionMenuEntry } = useActionMenuEntries();

  const workflow = useRecoilValue(recordStoreFamilyState(workflowId));

  const isDraft = workflow?.statuses?.includes('DRAFT');

  const workflowActiveVersion = useActiveWorkflowVersion(workflowId);

  const navigate = useNavigate();

  const registerSeeWorkflowActiveVersionWorkflowSingleRecordAction = ({
    position,
  }: {
    position: number;
  }) => {
    if (!isDefined(workflowActiveVersion) || !isDraft) {
      return;
    }

    addActionMenuEntry({
      key: 'see-workflow-active-version-single-record',
      label: 'See active version',
      position,
      type: ActionMenuEntryType.Standard,
      scope: ActionMenuEntryScope.RecordSelection,
      Icon: IconHistory,
      onClick: () => {
        navigate(
          `/object/${CoreObjectNameSingular.WorkflowVersion}/${workflowActiveVersion.id}`,
        );
      },
    });
  };

  const unregisterSeeWorkflowActiveVersionWorkflowSingleRecordAction = () => {
    removeActionMenuEntry('see-workflow-active-version-single-record');
  };

  return {
    registerSeeWorkflowActiveVersionWorkflowSingleRecordAction,
    unregisterSeeWorkflowActiveVersionWorkflowSingleRecordAction,
  };
};
