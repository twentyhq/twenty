import { type ThemeColor } from 'twenty-ui/theme';
import {
  IconBuildingSkyscraper,
  IconCheckbox,
  type IconComponent,
  IconNotes,
  IconTargetArrow,
  IconUser,
} from 'twenty-ui/display';

export type BackgroundMockNavigationItem = {
  label: string;
  Icon: IconComponent;
  color: ThemeColor;
};

export const BACKGROUND_MOCK_WORKSPACE_ITEMS = [
  { label: 'People', Icon: IconUser, color: 'blue' },
  { label: 'Companies', Icon: IconBuildingSkyscraper, color: 'blue' },
  { label: 'Opportunities', Icon: IconTargetArrow, color: 'red' },
  { label: 'Tasks', Icon: IconCheckbox, color: 'turquoise' },
  { label: 'Notes', Icon: IconNotes, color: 'turquoise' },
] satisfies BackgroundMockNavigationItem[];
