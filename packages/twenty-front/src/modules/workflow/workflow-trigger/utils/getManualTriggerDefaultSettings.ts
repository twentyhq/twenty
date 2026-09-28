import { type EnrichedObjectMetadataItem } from '@/object-metadata/types/EnrichedObjectMetadataItem';
import { type WorkflowManualTriggerSettings } from '@/workflow/types/Workflow';
import { COMMAND_MENU_DEFAULT_ICON } from '@/workflow/workflow-trigger/constants/CommandMenuDefaultIcon';
import { assertIsDefinedOrThrow, assertUnreachable } from 'twenty-shared/utils';

export const getManualTriggerDefaultSettings = ({
  availabilityType,
  activeNonSystemObjectMetadataItems,
  icon,
  isPinned,
}: {
  availabilityType: 'GLOBAL' | 'SINGLE_RECORD' | 'BULK_RECORDS';
  activeNonSystemObjectMetadataItems: EnrichedObjectMetadataItem[];
  icon?: string;
  isPinned?: boolean;
}): WorkflowManualTriggerSettings => {
  const defaultObjectNameSingular =
    activeNonSystemObjectMetadataItems[0]?.nameSingular;

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
      assertIsDefinedOrThrow(
        defaultObjectNameSingular,
        new Error('A record trigger needs at least one active object'),
      );

      return {
        objectType: defaultObjectNameSingular,
        availability: {
          type: 'SINGLE_RECORD',
          objectNameSingular: defaultObjectNameSingular,
        },
        outputSchema: {},
        icon: icon || COMMAND_MENU_DEFAULT_ICON,
        isPinned: isPinned || false,
      };
    }
    case 'BULK_RECORDS': {
      assertIsDefinedOrThrow(
        defaultObjectNameSingular,
        new Error('A record trigger needs at least one active object'),
      );

      return {
        objectType: defaultObjectNameSingular,
        availability: {
          type: 'BULK_RECORDS',
          objectNameSingular: defaultObjectNameSingular,
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
