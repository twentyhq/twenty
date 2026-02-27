import { type ObjectRecord } from '@/object-record/types/ObjectRecord';

import { mockedTaskRecords } from '~/testing/mock-data/generated/data/tasks/mock-tasks-data';

const allMockedTaskRecords = mockedTaskRecords as ObjectRecord[];

export const mockedTasks = allMockedTaskRecords;

export const getMockTaskRecord = (
  overrides?: Partial<ObjectRecord>,
  index = 0,
) => {
  return {
    ...allMockedTaskRecords[index],
    ...overrides,
  };
};
