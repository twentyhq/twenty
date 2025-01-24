import { renderHook } from '@testing-library/react';
import { ReactNode } from 'react';
import { RecoilRoot } from 'recoil';

import { useActivities } from '@/activities/hooks/useActivities';
import { useTasks } from '@/activities/tasks/hooks/useTasks';
import { ObjectFilterDropdownComponentInstanceContext } from '@/object-record/object-filter-dropdown/states/contexts/ObjectFilterDropdownComponentInstanceContext';

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

const useActivitiesMock = jest.fn(() => {
  return {
    activities: tasks,
  };
});

jest.mock('@/activities/hooks/useActivities', () => ({
  useActivities: jest.fn(),
}));

(useActivities as jest.Mock).mockImplementation(useActivitiesMock);

const Wrapper = ({ children }: { children: ReactNode }) => (
  <RecoilRoot>
    <ObjectFilterDropdownComponentInstanceContext.Provider
      value={{ instanceId: 'entity-tasks-filter-scope' }}
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

    expect(result.current).toEqual({
      tasks: tasks,
    });
  });
});
