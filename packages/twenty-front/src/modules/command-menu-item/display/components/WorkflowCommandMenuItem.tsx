import { HeadlessCommandMenuItem } from '@/command-menu-item/display/components/HeadlessCommandMenuItem';
import { useMountCommand } from '@/command-menu-item/engine-command/hooks/useMountCommand';
import { isEngineCommandMountedFamilySelector } from '@/command-menu-item/engine-command/selectors/isEngineCommandMountedFamilySelector';
import { isBulkRecordsManualTrigger } from '@/command-menu-item/record/utils/isBulkRecordsManualTrigger';
import { contextStoreTargetedRecordsRuleComponentState } from '@/context-store/states/contextStoreTargetedRecordsRuleComponentState';
import { ContextStoreComponentInstanceContext } from '@/context-store/states/contexts/ContextStoreComponentInstanceContext';
import { objectMetadataItemsSelector } from '@/object-metadata/states/objectMetadataItemsSelector';
import { useFindOneRecord } from '@/object-record/hooks/useFindOneRecord';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useAtomFamilySelectorValue } from '@/ui/utilities/state/jotai/hooks/useAtomFamilySelectorValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { type WorkflowVersion } from '@/workflow/types/Workflow';
import { useStore } from 'jotai';
import { CoreObjectNameSingular } from 'twenty-shared/types';
import { QUERY_MAX_RECORDS } from 'twenty-shared/constants';
import { isDefined } from 'twenty-shared/utils';
import {
  type CommandMenuItemAvailabilityType,
  CommandMenuItemAvailabilityType as CommandMenuItemAvailabilityTypeEnum,
  EngineComponentKey,
} from '~/generated-metadata/graphql';

export const WorkflowCommandMenuItem = ({
  workflowVersionId,
  commandMenuItemId,
  availabilityType,
  availabilityObjectMetadataId,
}: {
  workflowVersionId: string;
  commandMenuItemId: string;
  availabilityType: CommandMenuItemAvailabilityType;
  availabilityObjectMetadataId?: string | null;
}) => {
  const store = useStore();
  const mountCommand = useMountCommand();

  const contextStoreInstanceId = useAvailableComponentInstanceIdOrThrow(
    ContextStoreComponentInstanceContext,
  );

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

  const isMounted = useAtomFamilySelectorValue(
    isEngineCommandMountedFamilySelector,
    commandMenuItemId,
  );

  const selectedRecordIds =
    contextStoreTargetedRecordsRule.mode === 'selection'
      ? contextStoreTargetedRecordsRule.selectedRecordIds
      : [];

  const handleClick = () => {
    if (!isDefined(workflowVersion)) {
      return;
    }

    const payloads: Record<string, any>[] = [];

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

          if (isDefined(objectMetadataItem)) {
            payloads.push({
              [objectMetadataItem.namePlural]: selectedRecords,
            });
          }

          break;
        }

        for (const selectedRecordId of limitedSelectedRecordIds) {
          const selectedRecord = store.get(
            recordStoreFamilyState.atomFamily(selectedRecordId),
          );

          if (!isDefined(selectedRecord)) {
            continue;
          }

          payloads.push(selectedRecord);
        }

        break;
      }
      case CommandMenuItemAvailabilityTypeEnum.GLOBAL:
      case CommandMenuItemAvailabilityTypeEnum.FALLBACK: {
        break;
      }
    }

    mountCommand({
      engineCommandId: commandMenuItemId,
      contextStoreInstanceId,
      engineComponentKey: EngineComponentKey.TRIGGER_WORKFLOW_VERSION,
      workflowId: workflowVersion.workflowId,
      workflowVersionId: workflowVersion.id,
      payloads,
    });
  };

  return (
    <HeadlessCommandMenuItem
      isMounted={isMounted}
      commandMenuItemId={commandMenuItemId}
      onClick={handleClick}
    />
  );
};
