import { atom } from 'recoil';

import { ActivityForDrawer } from '../types/ActivityForDrawer';

export const DraftActivityState = atom<ActivityForDrawer | null>({
  key: 'activities/draft-activity-state',
  default: null,
});
