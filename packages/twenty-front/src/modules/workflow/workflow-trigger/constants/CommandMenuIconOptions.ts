import {
  IconBuildingSkyscraper,
  IconCheckbox,
  IconHandMove,
  IconNotes,
  IconRocket,
  IconSettingsAutomation,
  IconTargetArrow,
  IconUser,
  IconUserPlus,
} from 'twenty-ui/display';
import { SelectOption } from 'twenty-ui/input';

export const COMMAND_MENU_ICON_OPTIONS: Array<SelectOption<string>> = [
  {
    Icon: IconHandMove,
    value: 'IconHandMove',
    label: 'manual',
  },
  {
    Icon: IconSettingsAutomation,
    value: 'IconSettingsAutomation',
    label: 'automation',
  },
  {
    Icon: IconUser,
    value: 'IconUser',
    label: 'user',
  },
  {
    Icon: IconUserPlus,
    value: 'IconUserPlus',
    label: 'users',
  },
  {
    Icon: IconBuildingSkyscraper,
    value: 'IconBuildingSkyscraper',
    label: 'building-skyscraper',
  },
  {
    Icon: IconTargetArrow,
    value: 'IconTargetArrow',
    label: 'target-arrow',
  },
  {
    Icon: IconCheckbox,
    value: 'IconCheckbox',
    label: 'checkbox',
  },
  {
    Icon: IconNotes,
    value: 'IconNotes',
    label: 'notes',
  },
  {
    Icon: IconRocket,
    value: 'IconRocket',
    label: 'rocket',
  },
];
