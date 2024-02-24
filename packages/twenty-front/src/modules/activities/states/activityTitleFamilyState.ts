import { atomFamily } from 'recoil';

export const activityTitleFamilyState = atomFamily<
  string,
  { activityId: string }
>({
  key: 'activityTitleFamilyState',
  default: '',
});
