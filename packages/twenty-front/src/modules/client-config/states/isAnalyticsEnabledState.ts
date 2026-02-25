import { createAtomState } from '@/ui/utilities/state/jotai/utils/createAtomState';
export const isAnalyticsEnabledState = createAtomState<boolean>({
  key: 'isAnalyticsEnabled',
  defaultValue: false,
});
