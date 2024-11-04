import { useActionMenuEntries } from '@/action-menu/hooks/useActionMenuEntries';
import { contextStoreTargetedRecordsRuleComponentState } from '@/context-store/states/contextStoreTargetedRecordsRuleComponentState';
import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { useRecoilComponentValueV2 } from '@/ui/utilities/state/component-state/hooks/useRecoilComponentValueV2';
import { useActiveWorkflowVersionsWithTriggerRecordType } from '@/workflow/hooks/useActiveWorkflowVersionsWithTriggerRecordType';
import { useEffect } from 'react';
import { useRecoilValue } from 'recoil';
import { IconSettingsAutomation, isDefined } from 'twenty-ui';
import { capitalize } from '~/utils/string/capitalize';

export const WorkflowRunRecordActionEffect = ({
  objectMetadataItem,
}: {
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

  const { records: activeWorkflowVersions } =
    useActiveWorkflowVersionsWithTriggerRecordType({
      objectNameSingular: objectMetadataItem.nameSingular,
    });

  console.log('activeWorkflowVersions', activeWorkflowVersions);

  useEffect(() => {
    if (!isDefined(objectMetadataItem) || objectMetadataItem.isRemote) {
      return;
    }

    for (const [
      index,
      activeWorkflowVersion,
    ] of activeWorkflowVersions.entries()) {
      addActionMenuEntry({
        type: 'workflow-run',
        key: `workflow-run-${activeWorkflowVersion.workflow.name}`,
        label: capitalize(activeWorkflowVersion.workflow.name),
        position: index,
        Icon: IconSettingsAutomation,
        onClick: () => {
          console.log('run workflow');
        },
      });
    }

    return () => {
      for (const activeWorkflowVersion of activeWorkflowVersions) {
        removeActionMenuEntry(
          `workflow-run-${activeWorkflowVersion.workflow.name}`,
        );
      }
    };
  }, [
    activeWorkflowVersions,
    addActionMenuEntry,
    objectMetadataItem,
    removeActionMenuEntry,
  ]);

  return null;
};
