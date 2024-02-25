import { atomFamily } from 'recoil';

export const activityBodyFamilyState = atomFamily<
  string,
  { activityId: string }
>({
  key: 'activityBodyFamilyState',
  default: '',
});
