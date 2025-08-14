import { type ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import {
  type WorkflowManualTriggerAvailability,
  type WorkflowManualTriggerSettings,
} from '@/workflow/types/Workflow';
import { COMMAND_MENU_DEFAULT_ICON } from '@/workflow/workflow-trigger/constants/CommandMenuDefaultIcon';
import { assertUnreachable } from 'twenty-shared/utils';

export const getManualTriggerDefaultSettings = ({
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
      };
    }
    case 'WHEN_RECORD_SELECTED': {
      return {
        objectType: activeNonSystemObjectMetadataItems[0].nameSingular,
        outputSchema: {},
        icon: icon || COMMAND_MENU_DEFAULT_ICON,
        isPinned: isPinned || false,
      };
    }
  }

  return assertUnreachable(availability);
};
