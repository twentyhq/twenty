import { useActionMenuEntries } from '@/action-menu/hooks/useActionMenuEntries';
import {
  ActionMenuEntryScope,
  ActionMenuEntryType,
} from '@/action-menu/types/ActionMenuEntry';
import { contextStoreTargetedRecordsRuleComponentState } from '@/context-store/states/contextStoreTargetedRecordsRuleComponentState';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { useWorkflowWithCurrentVersion } from '@/workflow/hooks/useWorkflowWithCurrentVersion';
import { useNavigate } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { IconHistoryToggle, isDefined } from 'twenty-ui';

export const useSeeWorkflowExecutionsSingleRecordAction = ({
  position,
}: {
  position: number;
}) => {
  const { addActionMenuEntry, removeActionMenuEntry } = useActionMenuEntries();

  const contextStoreTargetedRecordsRule = useRecoilComponentValueV2(
    contextStoreTargetedRecordsRuleComponentState,
  );

  const selectedRecordId =
    contextStoreTargetedRecordsRule.mode === 'selection'
      ? contextStoreTargetedRecordsRule.selectedRecordIds[0]
      : undefined;

  const selectedRecord = useRecoilValue(
    recordStoreFamilyState(selectedRecordId ?? ''),
  );

  const workflowWithCurrentVersion = useWorkflowWithCurrentVersion(
    selectedRecord?.id,
  );

  const navigate = useNavigate();

  const registerSeeWorkflowExecutionsSingleRecordAction = () => {
    if (!isDefined(workflowWithCurrentVersion)) {
      return;
    }

    addActionMenuEntry({
      key: 'see-workflow-executions',
      label: 'See executions',
      position,
      type: ActionMenuEntryType.Standard,
      scope: ActionMenuEntryScope.RecordSelection,
      Icon: IconHistoryToggle,
      onClick: () => {
        //TODO: go to past executions page http://localhost:3001/objects/workflowRuns?filter%5Bworkflow%5D%5Bis%5D%5B0%5D=3323cf02-5b95-459d-b432-20714a3d9c77&view=f3da4217-24c6-414a-8214-81fbd6012c01
        navigate(`/object/workflow/${workflowWithCurrentVersion?.id}`);
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
