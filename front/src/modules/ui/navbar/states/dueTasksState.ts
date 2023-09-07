import { atom } from 'recoil';

import { TaskForList } from '@/activities/types/TaskForList';

export const dueTasksState = atom<(TaskForList[] | undefined) | []>({
  key: 'dueTasksState',
  default: [],
});
