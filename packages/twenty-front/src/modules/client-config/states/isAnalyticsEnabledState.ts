import { createState } from '@/ui/utilities/state/jotai/utils/createState';
export const isAnalyticsEnabledState = createState<boolean>({
  key: 'isAnalyticsEnabled',
  defaultValue: false,
});
