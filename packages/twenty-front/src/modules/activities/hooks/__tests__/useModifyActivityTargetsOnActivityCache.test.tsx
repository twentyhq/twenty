import { ReactNode } from 'react';
import { MockedProvider } from '@apollo/client/testing';
import { act, renderHook } from '@testing-library/react';
import { RecoilRoot } from 'recoil';

import { useModifyActivityTargetsOnActivityCache } from '@/activities/hooks/useModifyActivityTargetsOnActivityCache';
import { useModifyRecordFromCache } from '@/object-record/cache/hooks/useModifyRecordFromCache';

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

describe('useModifyActivityTargetsOnActivityCache', () => {
  it('works as expected', () => {
    const { result } = renderHook(
      () => useModifyActivityTargetsOnActivityCache(),
      {
        wrapper: Wrapper,
      },
    );

    act(() => {
      result.current.modifyActivityTargetsOnActivityCache({
        activityId: '1234',
        activityTargets: [],
      });
    });

    expect(useModifyRecordFromCacheMock).toHaveBeenCalled();
  });
});
