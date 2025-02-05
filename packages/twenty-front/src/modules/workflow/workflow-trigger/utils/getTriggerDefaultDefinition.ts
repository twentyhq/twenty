import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import {
  WorkflowTrigger,
  WorkflowTriggerType,
  WorkflowManualTriggerAvailability,
} from 'twenty-shared';
import { assertUnreachable } from '@/workflow/utils/assertUnreachable';
import { DATABASE_TRIGGER_TYPES } from '@/workflow/workflow-trigger/constants/DatabaseTriggerTypes';
import { getManualTriggerDefaultSettings } from '@/workflow/workflow-trigger/utils/getManualTriggerDefaultSettings';

export const getTriggerDefaultDefinition = ({
  defaultLabel,
  type,
  activeObjectMetadataItems,
}: {
  defaultLabel: string;
  type: WorkflowTriggerType;
  activeObjectMetadataItems: ObjectMetadataItem[];
}): WorkflowTrigger => {
  if (activeObjectMetadataItems.length === 0) {
    throw new Error(
      'This function need to receive at least one object metadata item to run.',
    );
  }

  switch (type) {
    case WorkflowTriggerType.DATABASE_EVENT: {
      return {
        type,
        name: '',
        settings: {
          eventName: `${activeObjectMetadataItems[0].nameSingular}.${
            DATABASE_TRIGGER_TYPES.find(
              (availableEvent) => availableEvent.defaultLabel === defaultLabel,
            )?.event
          }`,
          outputSchema: {},
        },
      };
    }
    case WorkflowTriggerType.MANUAL: {
      return {
        type,
        name: '',
        settings: getManualTriggerDefaultSettings({
          availability: WorkflowManualTriggerAvailability.WHEN_RECORD_SELECTED,
          activeObjectMetadataItems,
        }),
      };
    }
    default: {
      return assertUnreachable(type, `Unknown type: ${type}`);
    }
  }
};
