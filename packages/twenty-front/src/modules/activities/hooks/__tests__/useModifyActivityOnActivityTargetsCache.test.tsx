import { ReactNode } from 'react';
import { MockedProvider } from '@apollo/client/testing';
import { act, renderHook } from '@testing-library/react';
import { RecoilRoot } from 'recoil';

import { useModifyActivityOnActivityTargetsCache } from '@/activities/hooks/useModifyActivityOnActivityTargetCache';
import { useModifyRecordFromCache } from '@/object-record/cache/hooks/useModifyRecordFromCache';
import { mockedActivities } from '~/testing/mock-data/activities';

const useModifyRecordFromCacheMock = jest.fn();

jest.mock('@/object-record/cache/hooks/useModifyRecordFromCache', () => ({
  useModifyRecordFromCache: jest.fn(),
}));

(useModifyRecordFromCache as jest.Mock).mockImplementation(
  () => useModifyRecordFromCacheMock,
);

const Wrapper = ({ children }: { children: ReactNode }) => (
  <RecoilRoot>
    <MockedProvider addTypename={false}>{children}</MockedProvider>
  </RecoilRoot>
);

describe('useModifyActivityOnActivityTargetsCache', () => {
  it('works as expected', () => {
    const { result } = renderHook(
      () => useModifyActivityOnActivityTargetsCache(),
      {
        wrapper: Wrapper,
      },
    );

    act(() => {
      result.current.modifyActivityOnActivityTargetsCache({
        activity: mockedActivities[0],
        activityTargetIds: ['123', '456'],
      });
    });

    expect(useModifyRecordFromCacheMock).toHaveBeenCalled();
  });
});
