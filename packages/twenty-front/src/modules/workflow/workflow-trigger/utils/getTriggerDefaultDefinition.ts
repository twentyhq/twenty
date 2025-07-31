import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import {
  WorkflowAction,
  WorkflowTrigger,
  WorkflowTriggerType,
} from '@/workflow/types/Workflow';
import { assertUnreachable } from '@/workflow/utils/assertUnreachable';
import { DATABASE_TRIGGER_TYPES } from '@/workflow/workflow-trigger/constants/DatabaseTriggerTypes';
import { getManualTriggerDefaultSettings } from '@/workflow/workflow-trigger/utils/getManualTriggerDefaultSettings';
import { isDefined } from 'twenty-shared/utils';

const getRootStepIds = (steps: WorkflowAction[]): string[] => {
  const childIds = new Set<string>();

  for (const step of steps) {
    step.nextStepIds?.forEach((id) => childIds.add(id));
  }

  return steps.filter((step) => !childIds.has(step.id)).map((step) => step.id);
};

// TODO: This needs to be migrated to the server
export const getTriggerDefaultDefinition = ({
  defaultLabel,
  type,
  activeNonSystemObjectMetadataItems,
  steps,
}: {
  defaultLabel: string;
  type: WorkflowTriggerType;
  activeNonSystemObjectMetadataItems: ObjectMetadataItem[];
  steps?: WorkflowAction[] | null;
}): WorkflowTrigger => {
  if (activeNonSystemObjectMetadataItems.length === 0) {
    throw new Error(
      'This function need to receive at least one object metadata item to run.',
    );
  }

  const nextStepIds = isDefined(steps) ? getRootStepIds(steps) : [];

  const baseTriggerDefinition = {
    name: defaultLabel,
    position: { x: 0, y: 0 },
    nextStepIds,
  };

  switch (type) {
    case 'DATABASE_EVENT': {
      return {
        ...baseTriggerDefinition,
        type,
        settings: {
          eventName: `${activeNonSystemObjectMetadataItems[0].nameSingular}.${
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
        ...baseTriggerDefinition,
        type,
        settings: getManualTriggerDefaultSettings({
          availability: 'WHEN_RECORD_SELECTED',
          activeNonSystemObjectMetadataItems,
        }),
      };
    }
    case 'CRON': {
      return {
        ...baseTriggerDefinition,
        type,
        settings: {
          type: 'DAYS',
          schedule: { day: 1, hour: 0, minute: 0 },
          outputSchema: {},
        },
      };
    }
    case 'WEBHOOK': {
      return {
        ...baseTriggerDefinition,
        type,
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
