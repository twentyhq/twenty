import { Command } from '@/command-menu-item/display/components/Command';
import { isBulkRecordsManualTrigger } from '@/command-menu-item/record/utils/isBulkRecordsManualTrigger';
import { contextStoreTargetedRecordsRuleComponentState } from '@/context-store/states/contextStoreTargetedRecordsRuleComponentState';
import { objectMetadataItemsSelector } from '@/object-metadata/states/objectMetadataItemsSelector';
import { useFindOneRecord } from '@/object-record/hooks/useFindOneRecord';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { useRunWorkflowVersion } from '@/workflow/hooks/useRunWorkflowVersion';
import { type WorkflowVersion } from '@/workflow/types/Workflow';
import { useStore } from 'jotai';
import { CoreObjectNameSingular } from 'twenty-shared/types';
import { QUERY_MAX_RECORDS } from 'twenty-shared/constants';
import { isDefined } from 'twenty-shared/utils';
import {
  type CommandMenuItemAvailabilityType,
  CommandMenuItemAvailabilityType as CommandMenuItemAvailabilityTypeEnum,
} from '~/generated-metadata/graphql';

export const WorkflowCommandMenuItem = ({
  workflowVersionId,
  availabilityType,
  availabilityObjectMetadataId,
}: {
  workflowVersionId: string;
  availabilityType: CommandMenuItemAvailabilityType;
  availabilityObjectMetadataId?: string | null;
}) => {
  const store = useStore();
  const { runWorkflowVersion } = useRunWorkflowVersion();

  const { record: workflowVersion } = useFindOneRecord<
    Pick<WorkflowVersion, 'id' | 'workflowId' | 'trigger' | '__typename'>
  >({
    objectNameSingular: CoreObjectNameSingular.WorkflowVersion,
    objectRecordId: workflowVersionId,
    recordGqlFields: { id: true, workflowId: true, trigger: true },
  });

  const contextStoreTargetedRecordsRule = useAtomComponentStateValue(
    contextStoreTargetedRecordsRuleComponentState,
  );

  const objectMetadataItems = useAtomStateValue(objectMetadataItemsSelector);

  const selectedRecordIds =
    contextStoreTargetedRecordsRule.mode === 'selection'
      ? contextStoreTargetedRecordsRule.selectedRecordIds
      : [];

  const handleClick = async () => {
    if (!isDefined(workflowVersion)) {
      return;
    }

    switch (availabilityType) {
      case CommandMenuItemAvailabilityTypeEnum.RECORD_SELECTION: {
        if (selectedRecordIds.length === 0) {
          return;
        }

        const limitedSelectedRecordIds = selectedRecordIds.slice(
          0,
          QUERY_MAX_RECORDS,
        );

        const objectMetadataItem = objectMetadataItems.find(
          (metadata) => metadata.id === availabilityObjectMetadataId,
        );

        if (
          isDefined(workflowVersion.trigger) &&
          isBulkRecordsManualTrigger(workflowVersion.trigger)
        ) {
          const selectedRecords = limitedSelectedRecordIds
            .map((recordId) =>
              store.get(recordStoreFamilyState.atomFamily(recordId)),
            )
            .filter(isDefined);

          await runWorkflowVersion({
            workflowId: workflowVersion.workflowId,
            workflowVersionId: workflowVersion.id,
            payload: isDefined(objectMetadataItem)
              ? { [objectMetadataItem.namePlural]: selectedRecords }
              : undefined,
          });

          return;
        }

        for (const selectedRecordId of limitedSelectedRecordIds) {
          const selectedRecord = store.get(
            recordStoreFamilyState.atomFamily(selectedRecordId),
          );

          if (!isDefined(selectedRecord)) {
            continue;
          }

          await runWorkflowVersion({
            workflowId: workflowVersion.workflowId,
            workflowVersionId: workflowVersion.id,
            payload: selectedRecord,
          });
        }

        return;
      }
      case CommandMenuItemAvailabilityTypeEnum.GLOBAL:
      case CommandMenuItemAvailabilityTypeEnum.FALLBACK: {
        await runWorkflowVersion({
          workflowId: workflowVersion.workflowId,
          workflowVersionId: workflowVersion.id,
        });

        return;
      }
    }
  };

  return (
    <Command
      onClick={handleClick}
      closeSidePanelOnCommandMenuListExecution={false}
    />
  );
};
