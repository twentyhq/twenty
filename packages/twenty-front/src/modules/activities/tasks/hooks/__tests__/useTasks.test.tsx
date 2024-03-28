import { ReactNode } from 'react';
import { renderHook } from '@testing-library/react';
import { RecoilRoot } from 'recoil';

import { useActivities } from '@/activities/hooks/useActivities';
import { useTasks } from '@/activities/tasks/hooks/useTasks';
import { ObjectFilterDropdownScope } from '@/object-record/object-filter-dropdown/scopes/ObjectFilterDropdownScope';

const completedTasks = [
  {
    id: '1',
    completedAt: '2024-03-15T07:33:14.212Z',
  },
  {
    id: '2',
    completedAt: '2024-03-15T07:33:14.212Z',
  },
  {
    id: '3',
    completedAt: '2024-03-15T07:33:14.212Z',
  },
];

const unscheduledTasks = [
  {
    id: '4',
  },
];

const todayOrPreviousTasks = [
  {
    id: '5',
    dueAt: '2024-03-15T07:33:14.212Z',
  },
  {
    id: '6',
    dueAt: '2024-03-15T07:33:14.212Z',
  },
];

const useActivitiesMock = jest.fn(
  ({
    activitiesFilters,
  }: {
    activitiesFilters: { completedAt: { is: 'NULL' | 'NOT_NULL' } };
  }) => {
    const isCompletedFilter = activitiesFilters.completedAt.is === 'NOT_NULL';
    return {
      activities: isCompletedFilter
        ? completedTasks
        : [...todayOrPreviousTasks, ...unscheduledTasks],
      initialized: true,
    };
  },
);

jest.mock('@/activities/hooks/useActivities', () => ({
  useActivities: jest.fn(),
}));

(useActivities as jest.Mock).mockImplementation(useActivitiesMock);

const Wrapper = ({ children }: { children: ReactNode }) => (
  <RecoilRoot>
    <ObjectFilterDropdownScope filterScopeId="entity-tasks-filter-scope">
      {children}
    </ObjectFilterDropdownScope>
  </RecoilRoot>
);

describe('useTasks', () => {
  it("should return a user's tasks", () => {
    const { result } = renderHook(() => useTasks({ targetableObjects: [] }), {
      wrapper: Wrapper,
    });

    expect(result.current).toEqual({
      todayOrPreviousTasks,
      upcomingTasks: [],
      unscheduledTasks,
      completedTasks,
      initialized: true,
    });
  });
});
