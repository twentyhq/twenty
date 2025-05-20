import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import {
  WorkflowManualTriggerAvailability,
  WorkflowManualTriggerSettings,
} from '@/workflow/types/Workflow';
import { assertUnreachable } from '@/workflow/utils/assertUnreachable';

export const getManualTriggerDefaultSettings = ({
  availability,
  activeObjectNonSystemMetadataItems,
}: {
  availability: WorkflowManualTriggerAvailability;
  activeObjectNonSystemMetadataItems: ObjectMetadataItem[];
}): WorkflowManualTriggerSettings => {
  switch (availability) {
    case 'EVERYWHERE': {
      return {
        objectType: undefined,
        outputSchema: {},
      };
    }
    case 'WHEN_RECORD_SELECTED': {
      return {
        objectType: activeObjectNonSystemMetadataItems[0].nameSingular,
        outputSchema: {},
      };
    }
  }

  return assertUnreachable(availability);
};
