import { ReactNode } from 'react';
import { MockedProvider } from '@apollo/client/testing';
import { act, renderHook } from '@testing-library/react';
import { RecoilRoot } from 'recoil';

import { useRemoveFromActivityTargetsQueries } from '@/activities/hooks/useRemoveFromActivityTargetsQueries';
import { useReadFindManyRecordsQueryInCache } from '@/object-record/cache/hooks/useReadFindManyRecordsQueryInCache';
import { useUpsertFindManyRecordsQueryInCache } from '@/object-record/cache/hooks/useUpsertFindManyRecordsQueryInCache';
import { mockedActivities } from '~/testing/mock-data/activities';

const upsertFindManyRecordsQueryInCacheMock = jest.fn();
const useReadFindManyRecordsQueryInCacheMock = jest.fn(() => [
  { id: '981' },
  { id: '345' },
]);
jest.mock(
  '@/object-record/cache/hooks/useReadFindManyRecordsQueryInCache',
  () => ({
    useReadFindManyRecordsQueryInCache: jest.fn(),
  }),
);
jest.mock(
  '@/object-record/cache/hooks/useUpsertFindManyRecordsQueryInCache',
  () => ({
    useUpsertFindManyRecordsQueryInCache: jest.fn(),
  }),
);

(useReadFindManyRecordsQueryInCache as jest.Mock).mockImplementation(() => ({
  readFindManyRecordsQueryInCache: useReadFindManyRecordsQueryInCacheMock,
}));
(useUpsertFindManyRecordsQueryInCache as jest.Mock).mockImplementation(() => ({
  upsertFindManyRecordsQueryInCache: upsertFindManyRecordsQueryInCacheMock,
}));

const Wrapper = ({ children }: { children: ReactNode }) => (
  <RecoilRoot>
    <MockedProvider addTypename={false}>{children}</MockedProvider>
  </RecoilRoot>
);

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

describe('useRemoveFromActivityTargetsQueries', () => {
  it('works as expected', () => {
    const { result } = renderHook(() => useRemoveFromActivityTargetsQueries(), {
      wrapper: Wrapper,
    });

    act(() => {
      result.current.removeFromActivityTargetsQueries({
        activityTargetsToRemove: [mockActivityTarget],
        targetableObjects: [],
      });
    });

    expect(upsertFindManyRecordsQueryInCacheMock).toHaveBeenCalledWith({
      objectRecordsToOverwrite: [{ id: '981' }, { id: '345' }],
      queryVariables: { filter: {} },
      depth: 2,
    });
  });
});
