import { ObjectMetadataItem } from '@/object-metadata/types/ObjectMetadataItem';
import { OBJECT_EVENT_TRIGGERS } from '@/workflow/constants/ObjectEventTriggers';
import {
  WorkflowTrigger,
  WorkflowTriggerType,
} from '@/workflow/types/Workflow';
import { assertUnreachable } from '@/workflow/utils/assertUnreachable';

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
        },
      };
    }
    case 'MANUAL': {
      return {
        type,
        settings: {
          type: 'WHEN_RECORD_SELECTED',
          objectType: activeObjectMetadataItems[0].nameSingular,
        },
      };
    }
    default: {
      return assertUnreachable(type, `Unknown type: ${type}`);
    }
  }
};
