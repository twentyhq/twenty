import { createStateV2 } from '@/ui/utilities/state/jotai/utils/createStateV2';
export const isAnalyticsEnabledState = createStateV2<boolean>({
  key: 'isAnalyticsEnabled',
  defaultValue: false,
});
