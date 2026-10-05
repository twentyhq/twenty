import { t } from '@lingui/core/macro';
import { type SelectableItem } from '@/object-record/select/types/SelectableItem';
import {
  IconApi,
  IconCsv,
  IconGmail,
  IconGoogleCalendar,
  IconRobot,
  IconSettingsAutomation,
  IconUserCircle,
  IconWebhook,
} from 'twenty-ui/icon';

export const getActorSourceMultiSelectOptions = (
  selectedSourceNames: string[],
): SelectableItem[] => {
  return [
    {
      id: 'MANUAL',
      name: t`User`,
      isSelected: selectedSourceNames.includes('MANUAL'),
      AvatarIcon: IconUserCircle,
      isIconInverted: true,
    },
    {
      id: 'IMPORT',
      name: t`Import`,
      isSelected: selectedSourceNames.includes('IMPORT'),
      AvatarIcon: IconCsv,
      isIconInverted: true,
    },
    {
      id: 'API',
      name: t`API`,
      isSelected: selectedSourceNames.includes('API'),
      AvatarIcon: IconApi,
      isIconInverted: true,
    },
    {
      id: 'EMAIL',
      name: t`Email`,
      isSelected: selectedSourceNames.includes('EMAIL'),
      AvatarIcon: IconGmail,
    },
    {
      id: 'CALENDAR',
      name: t`Calendar`,
      isSelected: selectedSourceNames.includes('CALENDAR'),
      AvatarIcon: IconGoogleCalendar,
    },
    {
      id: 'WORKFLOW',
      name: t`Workflow`,
      isSelected: selectedSourceNames.includes('WORKFLOW'),
      AvatarIcon: IconSettingsAutomation,
      isIconInverted: true,
    },
    {
      id: 'WEBHOOK',
      name: t`Webhook`,
      isSelected: selectedSourceNames.includes('WEBHOOK'),
      AvatarIcon: IconWebhook,
      isIconInverted: true,
    },
    {
      id: 'SYSTEM',
      name: t`System`,
      isSelected: selectedSourceNames.includes('SYSTEM'),
      AvatarIcon: IconRobot,
      isIconInverted: true,
    },
  ];
};
