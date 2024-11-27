import { useActionMenuEntries } from '@/action-menu/hooks/useActionMenuEntries';
import {
  ActionMenuEntryScope,
  ActionMenuEntryType,
} from '@/action-menu/types/ActionMenuEntry';
import { contextStoreTargetedRecordsRuleComponentState } from '@/context-store/states/contextStoreTargetedRecordsRuleComponentState';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { FilterQueryParams } from '@/views/hooks/internal/useViewFromQueryParams';
import { ViewFilterOperand } from '@/views/types/ViewFilterOperand';
import { useWorkflowWithCurrentVersion } from '@/workflow/hooks/useWorkflowWithCurrentVersion';
import qs from 'qs';
import { useNavigate } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { IconHistoryToggle, isDefined } from 'twenty-ui';

export const useSeeWorkflowPreviousVersionsSingleRecordAction = () => {
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

  const registerSeeWorkflowPreviousVersionsSingleRecordAction = ({
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
    const filterLinkHref = `/objects/workflowVersions?${qs.stringify(
      filterQueryParams,
    )}`;

    addActionMenuEntry({
      key: 'see-workflow-previous-versions',
      label: 'See previous versions',
      position,
      type: ActionMenuEntryType.Standard,
      scope: ActionMenuEntryScope.RecordSelection,
      Icon: IconHistoryToggle,
      onClick: () => {
        navigate(filterLinkHref);
      },
    });
  };

  const unregisterSeeWorkflowPreviousVersionsSingleRecordAction = () => {
    removeActionMenuEntry('see-workflow-previous-versions');
  };

  return {
    registerSeeWorkflowPreviousVersionsSingleRecordAction,
    unregisterSeeWorkflowPreviousVersionsSingleRecordAction,
  };
};
