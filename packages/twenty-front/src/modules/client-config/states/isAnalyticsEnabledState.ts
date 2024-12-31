import { createState } from '@ui/utilities/state/utils/createState';

export const isAnalyticsEnabledState = createState<boolean>({
  key: 'isAnalyticsEnabled',
  defaultValue: false,
});
