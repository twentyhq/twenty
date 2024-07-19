import { renderHook } from '@testing-library/react';
import { ReactNode } from 'react';
import { RecoilRoot } from 'recoil';

import { useActivities } from '@/activities/hooks/useActivities';
import { useTasks } from '@/activities/tasks/hooks/useTasks';
import { ObjectFilterDropdownScope } from '@/object-record/object-filter-dropdown/scopes/ObjectFilterDropdownScope';

const completedTasks = [
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
    activitiesFilters: { status: { eq: 'TODO' | 'DONE' } };
  }) => {
    const isCompletedFilter = activitiesFilters.status.eq === 'DONE';
    return {
      activities: isCompletedFilter
        ? completedTasks
        : [...todayOrPreviousTasks, ...unscheduledTasks],
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
    });
  });
});
