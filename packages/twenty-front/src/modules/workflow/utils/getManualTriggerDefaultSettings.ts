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
        type: 'EVERYWHERE',
      };
    }
    case 'WHEN_RECORD_SELECTED': {
      return {
        type: 'WHEN_RECORD_SELECTED',
        objectType: activeObjectMetadataItems[0].nameSingular,
      };
    }
  }

  return assertUnreachable(availability);
};
