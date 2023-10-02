import { atom } from 'recoil';

import {
  ActivityType,
  InputMaybe,
  UserCreateNestedOneWithoutAssignedActivitiesInput,
} from '~/generated/graphql';

import { ActivityTargetableEntity } from '../types/ActivityTargetableEntity';

export type CurrentActivity = {
  id: string;
  type: ActivityType;
  targetableEntities?: ActivityTargetableEntity[];
  assignee?: InputMaybe<UserCreateNestedOneWithoutAssignedActivitiesInput>;
};

export const currentActivityState = atom<Partial<CurrentActivity> | null>({
  key: 'activities/current-activity',
  default: null,
});
