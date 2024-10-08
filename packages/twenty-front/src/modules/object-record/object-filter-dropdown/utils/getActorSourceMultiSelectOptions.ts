import { SelectableItem } from '@/object-record/select/types/SelectableItem';
import {
  IconApi,
  IconCsv,
  IconGmail,
  IconGoogleCalendar,
  IconRobot,
  IconSettingsAutomation,
  IconUserCircle,
} from 'twenty-ui';

export const getActorSourceMultiSelectOptions = (
  selectedSourceNames: string[],
): SelectableItem[] => {
  return [
    {
      id: 'MANUAL',
      name: 'User',
      isSelected: selectedSourceNames.includes('MANUAL'),
      AvatarIcon: IconUserCircle,
      isIconInverted: true,
    },
    {
      id: 'IMPORT',
      name: 'Import',
      isSelected: selectedSourceNames.includes('IMPORT'),
      AvatarIcon: IconCsv,
      isIconInverted: true,
    },
    {
      id: 'API',
      name: 'Api',
      isSelected: selectedSourceNames.includes('API'),
      AvatarIcon: IconApi,
      isIconInverted: true,
    },
    {
      id: 'EMAIL',
      name: 'Email',
      isSelected: selectedSourceNames.includes('EMAIL'),
      AvatarIcon: IconGmail,
    },
    {
      id: 'CALENDAR',
      name: 'Calendar',
      isSelected: selectedSourceNames.includes('CALENDAR'),
      AvatarIcon: IconGoogleCalendar,
    },
    {
      id: 'WORKFLOW',
      name: 'Workflow',
      isSelected: selectedSourceNames.includes('WORKFLOW'),
      AvatarIcon: IconSettingsAutomation,
      isIconInverted: true,
    },
    {
      id: 'SYSTEM',
      name: 'System',
      isSelected: selectedSourceNames.includes('SYSTEM'),
      AvatarIcon: IconRobot,
      isIconInverted: true,
    },
  ];
};
