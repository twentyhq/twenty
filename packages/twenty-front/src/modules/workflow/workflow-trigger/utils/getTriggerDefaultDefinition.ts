import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import {
  WorkflowTrigger,
  WorkflowTriggerType,
} from '@/workflow/types/Workflow';
import { assertUnreachable } from '@/workflow/utils/assertUnreachable';
import { DatabaseTriggerName } from '@/workflow/workflow-trigger/constants/DatabaseTriggerName';
import { OBJECT_EVENT_TRIGGERS } from '@/workflow/workflow-trigger/constants/ObjectEventTriggers';
import { getManualTriggerDefaultSettings } from '@/workflow/workflow-trigger/utils/getManualTriggerDefaultSettings';

const isDatabaseName = (name: string): name is DatabaseTriggerName => {
  return (name as DatabaseTriggerName) !== undefined;
};

export const getTriggerDefaultDefinition = ({
  name,
  type,
  activeObjectMetadataItems,
}: {
  name: string;
  type: WorkflowTriggerType;
  activeObjectMetadataItems: ObjectMetadataItem[];
}): WorkflowTrigger => {
  if (activeObjectMetadataItems.length === 0) {
    throw new Error(
      'This function need to receive at least one object metadata item to run.',
    );
  }

  switch (type) {
    case 'DATABASE_EVENT': {
      if (!isDatabaseName(name)) {
        throw new Error('Database event has an invalid name');
      }

      return {
        type,
        settings: {
          eventName: `${activeObjectMetadataItems[0].nameSingular}.${
            OBJECT_EVENT_TRIGGERS.find(
              (availableEvent) => availableEvent.label === name,
            )?.value
          }`,
          outputSchema: {},
        },
      };
    }
    case 'MANUAL': {
      return {
        type,
        settings: getManualTriggerDefaultSettings({
          availability: 'WHEN_RECORD_SELECTED',
          activeObjectMetadataItems,
        }),
      };
    }
    default: {
      return assertUnreachable(type, `Unknown type: ${type}`);
    }
  }
};
