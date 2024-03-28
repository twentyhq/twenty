import { ReactNode } from 'react';
import { MockedProvider } from '@apollo/client/testing';
import { act, renderHook } from '@testing-library/react';
import { RecoilRoot } from 'recoil';

import { useRemoveFromActivitiesQueries } from '@/activities/hooks/useRemoveFromActivitiesQueries';
import { useReadFindManyRecordsQueryInCache } from '@/object-record/cache/hooks/useReadFindManyRecordsQueryInCache';
import { useUpsertFindManyRecordsQueryInCache } from '@/object-record/cache/hooks/useUpsertFindManyRecordsQueryInCache';

const upsertFindManyRecordsQueryInCacheMock = jest.fn();
const useReadFindManyRecordsQueryInCacheMock = jest.fn(() => [
  { activityId: '981' },
  { activityId: '345' },
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

describe('useRemoveFromActivitiesQueries', () => {
  it('works as expected', () => {
    const { result } = renderHook(() => useRemoveFromActivitiesQueries(), {
      wrapper: Wrapper,
    });

    act(() => {
      result.current.removeFromActivitiesQueries({
        activityIdToRemove: '123',
        targetableObjects: [],
      });
    });

    expect(upsertFindManyRecordsQueryInCacheMock).toHaveBeenCalledWith({
      objectRecordsToOverwrite: [{ activityId: '981' }, { activityId: '345' }],
      queryVariables: {
        filter: { id: { in: ['345', '981'] } },
        orderBy: undefined,
      },
    });
  });
});
