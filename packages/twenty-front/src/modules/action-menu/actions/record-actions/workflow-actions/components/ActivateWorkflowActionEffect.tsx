import { useActionMenuEntries } from '@/action-menu/hooks/useActionMenuEntries';
import { contextStoreTargetedRecordsRuleComponentState } from '@/context-store/states/contextStoreTargetedRecordsRuleComponentState';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { useActivateWorkflowVersion } from '@/workflow/hooks/useActivateWorkflowVersion';
import { useWorkflowWithCurrentVersion } from '@/workflow/hooks/useWorkflowWithCurrentVersion';
import { useEffect } from 'react';
import { useRecoilValue } from 'recoil';
import { IconPower, isDefined } from 'twenty-ui';

export const ActivateWorkflowActionEffect = ({
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

  useEffect(() => {
    if (!isDefined(objectMetadataItem) || objectMetadataItem.isRemote) {
      return;
    }

    addActionMenuEntry({
      key: 'activate-workflow',
      label: 'Activate workflow',
      position,
      Icon: IconPower,
      onClick: () => {
        if (isDefined(workflowWithCurrentVersion)) {
          activateWorkflowVersion({
            workflowVersionId: workflowWithCurrentVersion.currentVersion.id,
            workflowId: workflowWithCurrentVersion.id,
          });
        }
      },
    });

    return () => {
      removeActionMenuEntry('activate-workflow');
    };
  }, [
    activateWorkflowVersion,
    addActionMenuEntry,
    objectMetadataItem,
    position,
    removeActionMenuEntry,
    selectedRecord,
    workflowWithCurrentVersion,
  ]);

  return null;
};
