import { createFamilyStateV2 } from '@/ui/utilities/state/jotai/utils/createFamilyStateV2';

export const activityBodyFamilyState = createFamilyStateV2<
  string,
  { activityId: string }
>({
  key: 'activityBodyFamilyState',
  defaultValue: '',
});
