import { type ThemeColor } from 'twenty-ui/theme';

export type RecordIndexTabItem = {
  id: string;
  label: string;
  // The All tab has no option behind it, hence no color
  color: ThemeColor | null;
  recordCount: number | undefined;
};
