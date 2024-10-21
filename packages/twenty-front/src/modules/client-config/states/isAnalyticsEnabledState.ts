import { createState } from 'twenty-ui';

export const isAnalyticsEnabledState = createState<boolean>({
  key: 'isAnalyticsEnabled',
  defaultValue: false,
});
