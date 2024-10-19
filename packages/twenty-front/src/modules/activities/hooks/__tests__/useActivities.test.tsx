import { renderHook } from '@testing-library/react';
import { ReactNode } from 'react';
import { RecoilRoot } from 'recoil';

import { useActivities } from '@/activities/hooks/useActivities';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';

jest.mock('@/activities/hooks/useActivityTargetsForTargetableObjects', () => ({
  useActivityTargetsForTargetableObjects: jest.fn(),
}));

jest.mock('@/object-record/hooks/useFindManyRecords', () => ({
  useFindManyRecords: jest.fn(),
}));

const mockActivityTarget = {
  __typename: 'ActivityTarget',
  updatedAt: '2021-08-03T19:20:06.000Z',
  createdAt: '2021-08-03T19:20:06.000Z',
  personId: '1',
  companyId: '1',
  id: '123',
};

const mockActivity = {
  __typename: 'Task',
  companyId: '123',
  updatedAt: '2021-08-03T19:20:06.000Z',
  createdAt: '2021-08-03T19:20:06.000Z',
  status: 'DONE',
  reminderAt: '2021-08-03T19:20:06.000Z',
  title: 'title',
  body: 'body',
  dueAt: '2021-08-03T19:20:06.000Z',
  assigneeId: '1',
  id: '234',
};

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
        activityTargets: [mockActivityTarget],
        loadingActivityTargets: false,
      },
    );

    const useFindManyRecordsMock = jest.requireMock(
      '@/object-record/hooks/useFindManyRecords',
    );
    useFindManyRecordsMock.useFindManyRecords.mockReturnValue({
      records: [mockActivity],
    });

    const { result } = renderHook(
      () => {
        const activities = useActivities({
          objectNameSingular: CoreObjectNameSingular.Task,
          targetableObjects: [
            { targetObjectNameSingular: 'company', id: '123' },
          ],
          activitiesFilters: {},
          activitiesOrderByVariables: [{}],
          skip: false,
        });
        return activities;
      },
      { wrapper: Wrapper },
    );

    expect(result.current.activities).toEqual([mockActivity]);
  });
});
