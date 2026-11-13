import { type ThemeColor } from 'twenty-ui/theme';

export type RecordIndexTabKind = 'option' | 'noValue' | 'all' | 'custom';

export type RecordIndexTab = {
  id: string;
  kind: RecordIndexTabKind;
  label: string;
  color?: ThemeColor;
  viewTabId?: string;
  isVisible: boolean;
};
