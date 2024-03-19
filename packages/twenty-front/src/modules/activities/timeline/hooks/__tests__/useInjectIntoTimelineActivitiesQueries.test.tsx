import { ReactNode } from 'react';
import { MockedProvider } from '@apollo/client/testing';
import { act, renderHook } from '@testing-library/react';
import { RecoilRoot } from 'recoil';

import { useInjectIntoTimelineActivitiesQueries } from '@/activities/timeline/hooks/useInjectIntoTimelineActivitiesQueries';
import { useUpsertFindManyRecordsQueryInCache } from '@/object-record/cache/hooks/useUpsertFindManyRecordsQueryInCache';
import { SnackBarProviderScope } from '@/ui/feedback/snack-bar-manager/scopes/SnackBarProviderScope';
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

const Wrapper = ({ children }: { children: ReactNode }) => (
  <RecoilRoot>
    <MockedProvider addTypename={false}>
      <SnackBarProviderScope snackBarManagerScopeId="snack-bar-manager">
        {children}
      </SnackBarProviderScope>
    </MockedProvider>
  </RecoilRoot>
);

describe('useInjectIntoTimelineActivitiesQueries', () => {
  it('works as expected', () => {
    const { result } = renderHook(
      () => useInjectIntoTimelineActivitiesQueries(),
      { wrapper: Wrapper },
    );

    act(() => {
      result.current.injectIntoTimelineActivitiesQueries({
        activityToInject: mockedActivities[0],
        activityTargetsToInject: [],
        timelineTargetableObject: {
          id: '123',
          targetObjectNameSingular: 'person',
        },
      });
    });

    expect(upsertFindManyRecordsQueryInCacheMock).toHaveBeenCalledTimes(1);
  });
});
