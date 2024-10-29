import { useActionMenuEntries } from '@/action-menu/hooks/useActionMenuEntries';
import { contextStoreTargetedRecordsRuleComponentState } from '@/context-store/states/contextStoreTargetedRecordsRuleComponentState';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { useActivateWorkflowVersion } from '@/workflow/hooks/useActivateWorkflowVersion';
import { useWorkflowWithCurrentVersion } from '@/workflow/hooks/useWorkflowWithCurrentVersion';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRecoilValue } from 'recoil';
import { IconHistoryToggle, isDefined } from 'twenty-ui';

export const SeeWorkflowExecutionsActionEffect = ({
  position,
  objectMetadataItem,
}: {
  position: number;
  objectMetadataItem: ObjectMetadataItem;
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

  const { activateWorkflowVersion } = useActivateWorkflowVersion();

  const workflowWithCurrentVersion = useWorkflowWithCurrentVersion(
    selectedRecord?.id,
  );

  const navigate = useNavigate();

  useEffect(() => {
    if (!isDefined(objectMetadataItem) || objectMetadataItem.isRemote) {
      return;
    }

    addActionMenuEntry({
      key: 'see-workflow-executions',
      label: 'See executions',
      position,
      Icon: IconHistoryToggle,
      onClick: () => {
        //TODO: go to past executions page http://localhost:3001/objects/workflowRuns?filter%5Bworkflow%5D%5Bis%5D%5B0%5D=3323cf02-5b95-459d-b432-20714a3d9c77&view=f3da4217-24c6-414a-8214-81fbd6012c01
        navigate(`/object/workflow/${workflowWithCurrentVersion?.id}`);
      },
    });

    return () => {
      removeActionMenuEntry('see-workflow-executions');
    };
  }, [
    activateWorkflowVersion,
    addActionMenuEntry,
    navigate,
    objectMetadataItem,
    position,
    removeActionMenuEntry,
    selectedRecord,
    workflowWithCurrentVersion,
  ]);
  return null;
};
