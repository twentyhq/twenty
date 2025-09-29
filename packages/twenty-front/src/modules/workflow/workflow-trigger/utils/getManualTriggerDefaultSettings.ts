import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { type WorkflowManualTriggerSettings } from '@/workflow/types/Workflow';
import { COMMAND_MENU_DEFAULT_ICON } from '@/workflow/workflow-trigger/constants/CommandMenuDefaultIcon';
import { assertUnreachable } from 'twenty-shared/utils';

export const getManualTriggerDefaultSettings = ({
  availabilityType,
  activeNonSystemObjectMetadataItems,
  icon,
  isPinned,
}: {
  availabilityType: 'GLOBAL' | 'SINGLE_RECORD' | 'BULK_RECORDS';
  activeNonSystemObjectMetadataItems: ObjectMetadataItem[];
  icon?: string;
  isPinned?: boolean;
}): WorkflowManualTriggerSettings => {
  switch (availabilityType) {
    case 'GLOBAL': {
      return {
        objectType: undefined,
        availability: {
          type: 'GLOBAL',
          locations: undefined,
        },
        outputSchema: {},
        icon: icon || COMMAND_MENU_DEFAULT_ICON,
        isPinned: isPinned || false,
      };
    }
    case 'SINGLE_RECORD': {
      return {
        objectType: activeNonSystemObjectMetadataItems[0].nameSingular,
        availability: {
          type: 'SINGLE_RECORD',
          objectNameSingular:
            activeNonSystemObjectMetadataItems[0].nameSingular,
        },
        outputSchema: {},
        icon: icon || COMMAND_MENU_DEFAULT_ICON,
        isPinned: isPinned || false,
      };
    }
    case 'BULK_RECORDS': {
      return {
        objectType: activeNonSystemObjectMetadataItems[0].nameSingular,
        availability: {
          type: 'BULK_RECORDS',
          objectNameSingular:
            activeNonSystemObjectMetadataItems[0].nameSingular,
        },
        outputSchema: {},
        icon: icon || COMMAND_MENU_DEFAULT_ICON,
        isPinned: isPinned || false,
      };
    }
    default: {
      return assertUnreachable(availabilityType);
    }
  }
};
