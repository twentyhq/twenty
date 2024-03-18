import { ReactNode } from 'react';
import { MockedProvider } from '@apollo/client/testing';
import { act, renderHook } from '@testing-library/react';
import { RecoilRoot } from 'recoil';

import { useInjectIntoActivityTargetsQueries } from '@/activities/hooks/useInjectIntoActivityTargetsQueries';
import { useUpsertFindManyRecordsQueryInCache } from '@/object-record/cache/hooks/useUpsertFindManyRecordsQueryInCache';
import { mockedActivities } from '~/testing/mock-data/activities';

const upsertFindManyRecordsQueryInCacheMock = jest.fn();

jest.mock(
  '@/object-record/cache/hooks/useUpsertFindManyRecordsQueryInCache',
  () => ({
    useUpsertFindManyRecordsQueryInCache: jest.fn(),
  }),
);

(useUpsertFindManyRecordsQueryInCache as jest.Mock).mockImplementation(() => ({
  upsertFindManyRecordsQueryInCache: upsertFindManyRecordsQueryInCacheMock,
}));

const mockActivityTarget = {
  __typename: 'ActivityTarget',
  updatedAt: '2021-08-03T19:20:06.000Z',
  createdAt: '2021-08-03T19:20:06.000Z',
  personId: '1',
  activityId: '234',
  companyId: '1',
  id: '123',
  activity: mockedActivities[0],
};

const Wrapper = ({ children }: { children: ReactNode }) => (
  <RecoilRoot>
    <MockedProvider addTypename={false}>{children}</MockedProvider>
  </RecoilRoot>
);

describe('useInjectIntoActivityTargetsQueries', () => {
  it('works as expected', () => {
    const { result } = renderHook(() => useInjectIntoActivityTargetsQueries(), {
      wrapper: Wrapper,
    });

    act(() => {
      result.current.injectActivityTargetsQueries({
        activityTargetsToInject: [mockActivityTarget],
        targetableObjects: [{ id: '123', targetObjectNameSingular: 'person' }],
      });

      expect(upsertFindManyRecordsQueryInCacheMock).toHaveBeenCalledTimes(1);
    });

    act(() => {
      result.current.injectActivityTargetsQueries({
        activityTargetsToInject: [mockActivityTarget],
        targetableObjects: [],
      });

      expect(upsertFindManyRecordsQueryInCacheMock).toHaveBeenCalledTimes(1);
    });
  });
});
