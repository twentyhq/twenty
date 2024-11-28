import { useActionMenuEntries } from '@/action-menu/hooks/useActionMenuEntries';
import {
  ActionMenuEntryScope,
  ActionMenuEntryType,
} from '@/action-menu/types/ActionMenuEntry';
import { contextStoreTargetedRecordsRuleComponentState } from '@/context-store/states/contextStoreTargetedRecordsRuleComponentState';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { useActiveWorkflowVersion } from '@/workflow/hooks/useActiveWorkflowVersion';
import { useNavigate } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { IconHistory, isDefined } from 'twenty-ui';

export const useSeeWorkflowActiveVersionSingleRecordAction = () => {
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

  const workflowActiveVersion = useActiveWorkflowVersion(selectedRecord?.id);

  const navigate = useNavigate();

  const registerSeeWorkflowActiveVersionSingleRecordAction = ({
    position,
  }: {
    position: number;
  }) => {
    if (!isDefined(workflowActiveVersion)) {
      return;
    }

    addActionMenuEntry({
      key: 'see-workflow-active-version',
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

  const unregisterSeeWorkflowActiveVersionSingleRecordAction = () => {
    removeActionMenuEntry('see-workflow-active-version');
  };

  return {
    registerSeeWorkflowActiveVersionSingleRecordAction,
    unregisterSeeWorkflowActiveVersionSingleRecordAction,
  };
};
