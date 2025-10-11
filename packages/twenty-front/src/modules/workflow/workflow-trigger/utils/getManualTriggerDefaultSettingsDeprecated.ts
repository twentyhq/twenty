import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import {
  type WorkflowManualTriggerAvailability,
  type WorkflowManualTriggerSettings,
} from '@/workflow/types/Workflow';
import { COMMAND_MENU_DEFAULT_ICON } from '@/workflow/workflow-trigger/constants/CommandMenuDefaultIcon';
import { assertUnreachable } from 'twenty-shared/utils';

export const getManualTriggerDefaultSettingsDeprecated = ({
  availability,
  activeNonSystemObjectMetadataItems,
  icon,
  isPinned,
}: {
  availability: WorkflowManualTriggerAvailability;
  activeNonSystemObjectMetadataItems: ObjectMetadataItem[];
  icon?: string;
  isPinned?: boolean;
}): WorkflowManualTriggerSettings => {
  switch (availability) {
    case 'EVERYWHERE': {
      return {
        objectType: undefined,
        outputSchema: {},
        icon: icon || COMMAND_MENU_DEFAULT_ICON,
        isPinned: isPinned || false,
        availability: {
          type: 'GLOBAL',
          locations: [],
        },
      };
    }
    case 'WHEN_RECORD_SELECTED': {
      return {
        objectType: activeNonSystemObjectMetadataItems[0].nameSingular,
        outputSchema: {},
        icon: icon || COMMAND_MENU_DEFAULT_ICON,
        isPinned: isPinned || false,
        availability: {
          type: 'SINGLE_RECORD',
          objectNameSingular:
            activeNonSystemObjectMetadataItems[0].nameSingular,
        },
      };
    }
  }

  return assertUnreachable(availability);
};
