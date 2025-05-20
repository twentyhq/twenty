import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import {
  WorkflowTrigger,
  WorkflowTriggerType,
} from '@/workflow/types/Workflow';
import { assertUnreachable } from '@/workflow/utils/assertUnreachable';
import { DATABASE_TRIGGER_TYPES } from '@/workflow/workflow-trigger/constants/DatabaseTriggerTypes';
import { getManualTriggerDefaultSettings } from '@/workflow/workflow-trigger/utils/getManualTriggerDefaultSettings';

export const getTriggerDefaultDefinition = ({
  defaultLabel,
  type,
  activeObjectNonSystemMetadataItems,
}: {
  defaultLabel: string;
  type: WorkflowTriggerType;
  activeObjectNonSystemMetadataItems: ObjectMetadataItem[];
}): WorkflowTrigger => {
  if (activeObjectNonSystemMetadataItems.length === 0) {
    throw new Error(
      'This function need to receive at least one object metadata item to run.',
    );
  }

  switch (type) {
    case 'DATABASE_EVENT': {
      return {
        type,
        name: defaultLabel,
        settings: {
          eventName: `${activeObjectNonSystemMetadataItems[0].nameSingular}.${
            DATABASE_TRIGGER_TYPES.find(
              (availableEvent) => availableEvent.defaultLabel === defaultLabel,
            )?.event
          }`,
          outputSchema: {},
        },
      };
    }
    case 'MANUAL': {
      return {
        type,
        name: defaultLabel,
        settings: getManualTriggerDefaultSettings({
          availability: 'WHEN_RECORD_SELECTED',
          activeObjectNonSystemMetadataItems,
        }),
      };
    }
    case 'CRON': {
      return {
        type,
        name: defaultLabel,
        settings: {
          type: 'DAYS',
          schedule: { day: 1, hour: 0, minute: 0 },
          outputSchema: {},
        },
      };
    }
    case 'WEBHOOK': {
      return {
        type,
        name: defaultLabel,
        settings: {
          outputSchema: {},
          httpMethod: 'GET',
          authentication: null,
        },
      };
    }
    default: {
      return assertUnreachable(type, `Unknown type: ${type}`);
    }
  }
};
