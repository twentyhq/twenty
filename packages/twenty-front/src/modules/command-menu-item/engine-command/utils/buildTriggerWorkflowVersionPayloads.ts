import { isBulkRecordsManualTrigger } from '@/command-menu-item/record/utils/isBulkRecordsManualTrigger';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type ObjectRecord } from '@/object-record/types/ObjectRecord';
import { type WorkflowTrigger } from '@/workflow/types/Workflow';
import { isDefined } from 'twenty-shared/utils';
import {
  type CommandMenuItemAvailabilityType,
  CommandMenuItemAvailabilityType as CommandMenuItemAvailabilityTypeEnum,
} from '~/generated-metadata/graphql';

export const buildTriggerWorkflowVersionPayloads = ({
  trigger,
  availabilityType,
  availabilityObjectMetadataId,
  objectMetadataItems,
  selectedRecords,
}: {
  trigger: WorkflowTrigger | null;
  availabilityType: CommandMenuItemAvailabilityType;
  availabilityObjectMetadataId?: string | null;
  objectMetadataItems: EnrichedObjectMetadataItem[];
  selectedRecords: ObjectRecord[];
}): Record<string, any>[] => {
  const payloads: Record<string, any>[] = [];

  switch (availabilityType) {
    case CommandMenuItemAvailabilityTypeEnum.RECORD_SELECTION: {
      if (selectedRecords.length === 0) {
        return payloads;
      }

      const objectMetadataItem = objectMetadataItems.find(
        (metadata) => metadata.id === availabilityObjectMetadataId,
      );

      if (isDefined(trigger) && isBulkRecordsManualTrigger(trigger)) {
        if (isDefined(objectMetadataItem)) {
          payloads.push({
            [objectMetadataItem.namePlural]: selectedRecords,
          });
        }

        return payloads;
      }

      for (const selectedRecord of selectedRecords) {
        payloads.push(selectedRecord);
      }

      return payloads;
    }
    case CommandMenuItemAvailabilityTypeEnum.GLOBAL:
    case CommandMenuItemAvailabilityTypeEnum.GLOBAL_OBJECT_CONTEXT:
    case CommandMenuItemAvailabilityTypeEnum.FALLBACK: {
      return payloads;
    }
    default: {
      return payloads;
    }
  }
};
