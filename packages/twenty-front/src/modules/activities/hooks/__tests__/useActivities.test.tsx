import { renderHook } from '@testing-library/react';
import { type ReactNode } from 'react';
import { RecoilRoot } from 'recoil';

import { useActivities } from '@/activities/hooks/useActivities';
import { type Task } from '@/activities/types/Task';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';

jest.mock('@/activities/hooks/useActivityTargetsForTargetableObjects', () => ({
  useActivityTargetsForTargetableObjects: jest.fn(),
}));

jest.mock('@/object-record/hooks/useFindManyRecords', () => ({
  useFindManyRecords: jest.fn(),
}));

const mockActivityTarget = {
  __typename: 'TaskTarget',
  updatedAt: '2021-08-03T19:20:06.000Z',
  createdAt: '2021-08-03T19:20:06.000Z',
  personId: '1',
  companyId: '1',
  id: '123',
};

const mockActivity = {
  __typename: 'Task',
  updatedAt: '2021-08-03T19:20:06.000Z',
  createdAt: '2021-08-03T19:20:06.000Z',
  status: 'DONE',
  title: 'title',
  dueAt: '2021-08-03T19:20:06.000Z',
  assigneeId: '1',
  id: '234',
  bodyV2: {
    blocknote: 'My Body',
    markdown: 'My Body',
  },
  assignee: null,
  taskTargets: [],
} satisfies Task;

const Wrapper = ({ children }: { children: ReactNode }) => (
  <RecoilRoot>{children}</RecoilRoot>
);

describe('useActivities', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('fetches activities', async () => {
    const useActivityTargetsForTargetableObjectsMock = jest.requireMock(
      '@/activities/hooks/useActivityTargetsForTargetableObjects',
    );
    useActivityTargetsForTargetableObjectsMock.useActivityTargetsForTargetableObjects.mockReturnValue(
      {
        activityTargets: [{ ...mockActivityTarget, task: mockActivity }],
        loadingActivityTargets: false,
      },
    );

    const { result } = renderHook(
      () => {
        const activities = useActivities({
          objectNameSingular: CoreObjectNameSingular.Task,
          targetableObjects: [
            { targetObjectNameSingular: 'company', id: '123' },
          ],
          skip: false,
          limit: 10,
          activityTargetsOrderByVariables: [{}],
        });
        return activities;
      },
      { wrapper: Wrapper },
    );

    expect(result.current.activities).toEqual([mockActivity]);
  });
});
