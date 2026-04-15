import type { Store } from 'jotai/vanilla/store';

import { isBulkRecordsManualTrigger } from '@/command-menu-item/record/utils/isBulkRecordsManualTrigger';
import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { recordStoreFamilyState } from '@/object-record/record-store/states/recordStoreFamilyState';
import { type WorkflowTrigger } from '@/workflow/types/Workflow';
import { QUERY_MAX_RECORDS } from 'twenty-shared/constants';
import { isDefined } from 'twenty-shared/utils';
import {
  type CommandMenuItemAvailabilityType,
  CommandMenuItemAvailabilityType as CommandMenuItemAvailabilityTypeEnum,
} from '~/generated-metadata/graphql';

export const buildTriggerWorkflowVersionPayloads = ({
  store,
  trigger,
  availabilityType,
  availabilityObjectMetadataId,
  objectMetadataItems,
  selectedRecordIds,
}: {
  store: Store;
  trigger: WorkflowTrigger | null;
  availabilityType: CommandMenuItemAvailabilityType;
  availabilityObjectMetadataId?: string | null;
  objectMetadataItems: EnrichedObjectMetadataItem[];
  selectedRecordIds: string[];
}): Record<string, any>[] => {
  const payloads: Record<string, any>[] = [];

  switch (availabilityType) {
    case CommandMenuItemAvailabilityTypeEnum.RECORD_SELECTION: {
      if (selectedRecordIds.length === 0) {
        return payloads;
      }

      const limitedSelectedRecordIds = selectedRecordIds.slice(
        0,
        QUERY_MAX_RECORDS,
      );

      const objectMetadataItem = objectMetadataItems.find(
        (metadata) => metadata.id === availabilityObjectMetadataId,
      );

      if (isDefined(trigger) && isBulkRecordsManualTrigger(trigger)) {
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

        return payloads;
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
