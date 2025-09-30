import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import {
  type WorkflowTrigger,
  type WorkflowTriggerType,
} from '@/workflow/types/Workflow';
import { DATABASE_TRIGGER_TYPES } from '@/workflow/workflow-trigger/constants/DatabaseTriggerTypes';
import { getManualTriggerDefaultSettings } from '@/workflow/workflow-trigger/utils/getManualTriggerDefaultSettings';
import { getManualTriggerDefaultSettingsDeprecated } from '@/workflow/workflow-trigger/utils/getManualTriggerDefaultSettingsDeprecated';
import { assertUnreachable } from 'twenty-shared/utils';

// TODO: This needs to be migrated to the server
export const getTriggerDefaultDefinition = ({
  defaultLabel,
  type,
  activeNonSystemObjectMetadataItems,
  isIteratorEnabled,
}: {
  defaultLabel: string;
  type: WorkflowTriggerType;
  activeNonSystemObjectMetadataItems: ObjectMetadataItem[];
  isIteratorEnabled: boolean;
}): WorkflowTrigger => {
  if (activeNonSystemObjectMetadataItems.length === 0) {
    throw new Error(
      'This function need to receive at least one object metadata item to run.',
    );
  }

  const baseTriggerDefinition = {
    name: defaultLabel,
    position: { x: 0, y: 0 },
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
      if (isIteratorEnabled) {
        return {
          ...baseTriggerDefinition,
          type,
          settings: getManualTriggerDefaultSettings({
            availabilityType: 'GLOBAL',
            activeNonSystemObjectMetadataItems,
          }),
        };
      }
      return {
        ...baseTriggerDefinition,
        type,
        settings: getManualTriggerDefaultSettingsDeprecated({
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
