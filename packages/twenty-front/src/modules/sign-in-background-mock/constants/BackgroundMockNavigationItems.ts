import {
  IconBuildingSkyscraper,
  IconCalendarEvent,
  IconCheckbox,
  type IconComponent,
  IconFileText,
  IconHeart,
  IconLayoutDashboard,
  IconNotes,
  IconRocket,
  IconStar,
  IconTargetArrow,
  IconUser,
  IconUserCircle,
} from 'twenty-ui/display';
import { type ThemeColor } from 'twenty-ui/theme';

export type BackgroundMockNavigationItem = {
  label: string;
  Icon: IconComponent;
  color: ThemeColor;
};

export const BACKGROUND_MOCK_WORKSPACE_ITEMS = [
  { label: 'Companies', Icon: IconBuildingSkyscraper, color: 'blue' },
  { label: 'People', Icon: IconUser, color: 'blue' },
  { label: 'Opportunities', Icon: IconTargetArrow, color: 'red' },
  { label: 'Tasks', Icon: IconCheckbox, color: 'turquoise' },
  { label: 'Notes', Icon: IconNotes, color: 'turquoise' },
  { label: 'Dashboards', Icon: IconLayoutDashboard, color: 'orange' },
  { label: 'Workflows', Icon: IconRocket, color: 'pink' },
  { label: 'Rockets', Icon: IconRocket, color: 'sky' },
  { label: 'Pets', Icon: IconHeart, color: 'orange' },
  { label: 'Survey results', Icon: IconStar, color: 'yellow' },
  { label: 'Employment Histories', Icon: IconUserCircle, color: 'green' },
  { label: 'Pet Care Agreements', Icon: IconFileText, color: 'purple' },
  { label: 'Star History', Icon: IconCalendarEvent, color: 'red' },
] satisfies BackgroundMockNavigationItem[];
