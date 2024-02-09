import { atomFamily } from 'recoil';

export const activityTitleHasBeenSetFamilyState = atomFamily<
  boolean,
  { activityId: string }
>({
  key: 'activityTitleHasBeenSetFamilyState',
  default: false,
});
