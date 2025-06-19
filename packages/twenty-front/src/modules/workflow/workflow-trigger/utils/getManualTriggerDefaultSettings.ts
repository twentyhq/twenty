import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import {
  WorkflowManualTriggerAvailability,
  WorkflowManualTriggerSettings,
} from '@/workflow/types/Workflow';
import { assertUnreachable } from '@/workflow/utils/assertUnreachable';
import { COMMAND_MENU_DEFAULT_ICON } from '@/workflow/workflow-trigger/constants/CommandMenuDefaultIcon';

export const getManualTriggerDefaultSettings = ({
  availability,
  activeNonSystemObjectMetadataItems,
  icon,
}: {
  availability: WorkflowManualTriggerAvailability;
  activeNonSystemObjectMetadataItems: ObjectMetadataItem[];
  icon?: string;
}): WorkflowManualTriggerSettings => {
  switch (availability) {
    case 'EVERYWHERE': {
      return {
        objectType: undefined,
        outputSchema: {},
        icon: icon || COMMAND_MENU_DEFAULT_ICON,
      };
    }
    case 'WHEN_RECORD_SELECTED': {
      return {
        objectType: activeNonSystemObjectMetadataItems[0].nameSingular,
        outputSchema: {},
        icon: icon || COMMAND_MENU_DEFAULT_ICON,
      };
    }
  }

  return assertUnreachable(availability);
};
