import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import {
  WorkflowManualTriggerAvailability,
  WorkflowManualTriggerSettings,
} from 'twenty-shared';
import { assertUnreachable } from '@/workflow/utils/assertUnreachable';

export const getManualTriggerDefaultSettings = ({
  availability,
  activeObjectMetadataItems,
}: {
  availability: WorkflowManualTriggerAvailability;
  activeObjectMetadataItems: ObjectMetadataItem[];
}): WorkflowManualTriggerSettings => {
  switch (availability) {
    case WorkflowManualTriggerAvailability.EVERYWHERE: {
      return {
        objectType: undefined,
        outputSchema: {},
      };
    }
    case WorkflowManualTriggerAvailability.WHEN_RECORD_SELECTED: {
      return {
        objectType: activeObjectMetadataItems[0].nameSingular,
        outputSchema: {},
      };
    }
  }

  return assertUnreachable(availability);
};
