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
}: {
  availability: WorkflowManualTriggerAvailability;
  activeNonSystemObjectMetadataItems: ObjectMetadataItem[];
}): WorkflowManualTriggerSettings => {
  switch (availability) {
    case 'EVERYWHERE': {
      return {
        objectType: undefined,
        outputSchema: {},
        icon: COMMAND_MENU_DEFAULT_ICON,
      };
    }
    case 'WHEN_RECORD_SELECTED': {
      return {
        objectType: activeNonSystemObjectMetadataItems[0].nameSingular,
        outputSchema: {},
        icon: COMMAND_MENU_DEFAULT_ICON,
      };
    }
  }

  return assertUnreachable(availability);
};
