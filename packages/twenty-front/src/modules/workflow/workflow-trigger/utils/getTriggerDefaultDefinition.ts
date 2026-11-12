import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import {
  type WorkflowTrigger,
  type WorkflowTriggerType,
} from '@/workflow/types/Workflow';
import { DATABASE_TRIGGER_TYPES } from '@/workflow/workflow-trigger/constants/DatabaseTriggerTypes';
import { getManualTriggerDefaultSettings } from '@/workflow/workflow-trigger/utils/getManualTriggerDefaultSettings';
import { assertUnreachable } from 'twenty-shared/utils';
import { doNotTranslate } from 'twenty-shared/i18n';
import { computeCronPatternFromWorkflowCronSchedule } from '@/workflow/workflow-trigger/utils/computeCronPatternFromWorkflowCronSchedule';
import { getCronTriggerDefaultSchedule } from '@/workflow/workflow-trigger/utils/getCronTriggerDefaultSchedule';

// TODO: This needs to be migrated to the server
export const getTriggerDefaultDefinition = ({
  defaultLabel,
  type,
  activeNonSystemObjectMetadataItems,
}: {
  defaultLabel: string;
  type: WorkflowTriggerType;
  activeNonSystemObjectMetadataItems: EnrichedObjectMetadataItem[];
}): WorkflowTrigger => {
  if (activeNonSystemObjectMetadataItems.length === 0) {
    throw new Error(
      doNotTranslate(
        'This function need to receive at least one object metadata item to run.',
      ),
    );
  }

  const baseTriggerDefinition = {
    name: defaultLabel,
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
          availabilityType: 'GLOBAL',
          activeNonSystemObjectMetadataItems,
        }),
      };
    }
    case 'CRON': {
      return {
        ...baseTriggerDefinition,
        type,
        settings: {
          pattern: computeCronPatternFromWorkflowCronSchedule(
            getCronTriggerDefaultSchedule('DAYS'),
          ),
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
