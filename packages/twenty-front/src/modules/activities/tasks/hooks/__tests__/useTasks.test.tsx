import { renderHook } from '@testing-library/react';
import { type ReactNode } from 'react';
import { RecoilRoot } from 'recoil';
import { vi } from 'vitest';

import { useActivities } from '@/activities/hooks/useActivities';
import { useTasks } from '@/activities/tasks/hooks/useTasks';
import { type ActivityTargetableObject } from '@/activities/types/ActivityTargetableEntity';
import { type CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
import { ObjectFilterDropdownComponentInstanceContext } from '@/object-record/object-filter-dropdown/states/contexts/ObjectFilterDropdownComponentInstanceContext';
import { type RecordGqlOperationOrderBy } from 'twenty-shared/types';

const tasks = [
  {
    id: '1',
    status: 'DONE',
  },
  {
    id: '2',
    status: 'DONE',
  },
  {
    id: '3',
    status: 'DONE',
  },
  {
    id: '4',
  },
  {
    id: '5',
    dueAt: '2024-03-15T07:33:14.212Z',
  },
  {
    id: '6',
    dueAt: '2024-03-15T07:33:14.212Z',
  },
];

const useActivitiesMock = vi.fn(
  (_params: {
    objectNameSingular:
      | CoreObjectNameSingular.Note
      | CoreObjectNameSingular.Task;
    targetableObjects: ActivityTargetableObject[];
    activityTargetsOrderByVariables: RecordGqlOperationOrderBy;
    skip?: boolean;
    limit: number;
  }) => {
    return {
      activities: tasks,
      loading: false,
      totalCountActivities: tasks.length,
      fetchMoreActivities: vi.fn(),
      hasNextPage: false,
    };
  },
);

vi.mock('@/activities/hooks/useActivities', () => ({
  useActivities: vi.fn(),
}));

vi.mocked(useActivities).mockImplementation(
  useActivitiesMock as typeof useActivities,
);

const Wrapper = ({ children }: { children: ReactNode }) => (
  <RecoilRoot>
    <ObjectFilterDropdownComponentInstanceContext.Provider
      value={{ instanceId: 'entity-tasks-filter-instance' }}
    >
      {children}
    </ObjectFilterDropdownComponentInstanceContext.Provider>
  </RecoilRoot>
);

describe('useTasks', () => {
  it("should return a user's tasks", () => {
    const { result } = renderHook(() => useTasks({ targetableObjects: [] }), {
      wrapper: Wrapper,
    });

    expect(result.current.tasks).toEqual(tasks);
    expect(result.current.tasksLoading).toBe(false);
    expect(result.current.totalCountTasks).toBe(tasks.length);
    expect(result.current.hasNextPage).toBe(false);
    expect(result.current.fetchMoreTasks).toBeInstanceOf(Function);
  });
});
