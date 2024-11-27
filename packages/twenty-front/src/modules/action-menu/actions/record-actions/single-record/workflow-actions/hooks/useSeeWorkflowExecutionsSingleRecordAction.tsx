import { useActionMenuEntries } from '@/action-menu/hooks/useActionMenuEntries';
import {
  ActionMenuEntryScope,
  ActionMenuEntryType,
} from '@/action-menu/types/ActionMenuEntry';
import { contextStoreTargetedRecordsRuleComponentState } from '@/context-store/states/contextStoreTargetedRecordsRuleComponentState';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { usePrefetchedData } from '@/prefetch/hooks/usePrefetchedData';
import { PrefetchKey } from '@/prefetch/types/PrefetchKey';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { FilterQueryParams } from '@/views/hooks/internal/useViewFromQueryParams';
import { View } from '@/views/types/View';
import { ViewFilterOperand } from '@/views/types/ViewFilterOperand';
import { useWorkflowWithCurrentVersion } from '@/workflow/hooks/useWorkflowWithCurrentVersion';
import qs from 'qs';
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

  const { records: views } = usePrefetchedData<View>(PrefetchKey.AllViews);

  const registerSeeWorkflowExecutionsSingleRecordAction = () => {
    if (!isDefined(workflowWithCurrentVersion)) {
      return;
    }

    const indexView = views.find(
      (view) =>
        view.key === 'INDEX' &&
        view.objectMetadataId === workflowWithCurrentVersion.id,
    );

    const filterQueryParams: FilterQueryParams = {
      filter: {
        workflow: {
          [ViewFilterOperand.Is]: [workflowWithCurrentVersion.id],
        },
      },
      view: indexView?.id,
    };
    const filterLinkHref = `/objects/workflowRuns?${qs.stringify(
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
