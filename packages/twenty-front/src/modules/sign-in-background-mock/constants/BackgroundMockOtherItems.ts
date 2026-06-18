import { IconFileText, IconSettings } from 'twenty-ui/display';

import { type BackgroundMockNavigationItem } from '@/sign-in-background-mock/constants/BackgroundMockNavigationItems';

export const BACKGROUND_MOCK_OTHER_ITEMS = [
  { label: 'Settings', Icon: IconSettings, color: 'gray' },
  { label: 'Documentation', Icon: IconFileText, color: 'gray' },
] satisfies BackgroundMockNavigationItem[];
