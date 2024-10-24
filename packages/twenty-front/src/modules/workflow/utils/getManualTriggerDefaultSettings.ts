import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import {
  WorkflowManualTriggerAvailability,
  WorkflowManualTriggerSettings,
} from '@/workflow/types/Workflow';
import { assertUnreachable } from '@/workflow/utils/assertUnreachable';

export const getManualTriggerDefaultSettings = ({
  availability,
  activeObjectMetadataItems,
}: {
  availability: WorkflowManualTriggerAvailability;
  activeObjectMetadataItems: ObjectMetadataItem[];
}): WorkflowManualTriggerSettings => {
  switch (availability) {
    case 'EVERYWHERE': {
      return {
        availability: 'EVERYWHERE',
      };
    }
    case 'WHEN_RECORD_SELECTED': {
      return {
        availability: 'WHEN_RECORD_SELECTED',
        objectType: activeObjectMetadataItems[0].nameSingular,
      };
    }
  }

  return assertUnreachable(availability);
};
