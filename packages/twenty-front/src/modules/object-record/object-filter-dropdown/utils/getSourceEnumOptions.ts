import { SelectableItem } from '@/object-record/select/types/SelectableItem';
import {
  IconApi,
  IconCsv,
  IconGmail,
  IconGoogleCalendar,
  IconSettingsAutomation,
  IconUserCircle,
} from 'twenty-ui';

export const getSourceEnumOptions = (
  selectedItemIds: string[],
): SelectableItem[] => {
  return [
    {
      id: 'MANUAL',
      name: 'User',
      isSelected: selectedItemIds.includes('MANUAL'),
      AvatarIcon: IconUserCircle,
      isIconInverted: true,
    },
    {
      id: 'IMPORT',
      name: 'Import',
      isSelected: selectedItemIds.includes('IMPORT'),
      AvatarIcon: IconCsv,
      isIconInverted: true,
    },
    {
      id: 'API',
      name: 'Api',
      isSelected: selectedItemIds.includes('API'),
      AvatarIcon: IconApi,
      isIconInverted: true,
    },
    {
      id: 'EMAIL',
      name: 'Email',
      isSelected: selectedItemIds.includes('EMAIL'),
      AvatarIcon: IconGmail,
    },
    {
      id: 'CALENDAR',
      name: 'Calendar',
      isSelected: selectedItemIds.includes('CALENDAR'),
      AvatarIcon: IconGoogleCalendar,
    },
    {
      id: 'WORKFLOW',
      name: 'Workflow',
      isSelected: selectedItemIds.includes('WORKFLOW'),
      AvatarIcon: IconSettingsAutomation,
      isIconInverted: true,
    },
  ];
};
