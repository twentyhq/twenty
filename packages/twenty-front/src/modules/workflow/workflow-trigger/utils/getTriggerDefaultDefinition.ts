import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import {
  WorkflowTrigger,
  WorkflowTriggerType,
} from '@/workflow/types/Workflow';
import { assertUnreachable } from '@/workflow/utils/assertUnreachable';
import { OBJECT_EVENT_TRIGGERS } from '@/workflow/workflow-trigger/constants/ObjectEventTriggers';
import { getManualTriggerDefaultSettings } from '@/workflow/workflow-trigger/utils/getManualTriggerDefaultSettings';

export const getTriggerDefaultDefinition = ({
  type,
  activeObjectMetadataItems,
}: {
  type: WorkflowTriggerType;
  activeObjectMetadataItems: ObjectMetadataItem[];
}): WorkflowTrigger => {
  if (activeObjectMetadataItems.length === 0) {
    throw new Error(
      'This function need to receive at least one object metadata item to run.',
    );
  }

  switch (type) {
    case 'DATABASE_EVENT': {
      return {
        type,
        settings: {
          eventName: `${activeObjectMetadataItems[0].nameSingular}.${OBJECT_EVENT_TRIGGERS[0].value}`,
          outputSchema: {},
        },
      };
    }
    case 'MANUAL': {
      return {
        type,
        settings: getManualTriggerDefaultSettings({
          availability: 'WHEN_RECORD_SELECTED',
          activeObjectMetadataItems,
        }),
      };
    }
    default: {
      return assertUnreachable(type, `Unknown type: ${type}`);
    }
  }
};
