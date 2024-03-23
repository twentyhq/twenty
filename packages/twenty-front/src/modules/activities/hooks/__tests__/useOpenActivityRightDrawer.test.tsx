import { ReactNode } from 'react';
import { MockedProvider } from '@apollo/client/testing';
import { act, renderHook } from '@testing-library/react';
import { RecoilRoot, useRecoilValue } from 'recoil';

import { useOpenActivityRightDrawer } from '@/activities/hooks/useOpenActivityRightDrawer';
import { activityIdInDrawerState } from '@/activities/states/activityIdInDrawerState';
import { viewableActivityIdState } from '@/activities/states/viewableActivityIdState';

const Wrapper = ({ children }: { children: ReactNode }) => (
  <RecoilRoot>
    <MockedProvider addTypename={false}>{children}</MockedProvider>
  </RecoilRoot>
);

describe('useOpenActivityRightDrawer', () => {
  it('works as expected', () => {
    const { result } = renderHook(
      () => {
        const openActivityRightDrawer = useOpenActivityRightDrawer();
        const viewableActivityId = useRecoilValue(viewableActivityIdState);
        const activityIdInDrawer = useRecoilValue(activityIdInDrawerState);
        return {
          openActivityRightDrawer,
          activityIdInDrawer,
          viewableActivityId,
        };
      },
      {
        wrapper: Wrapper,
      },
    );

    expect(result.current.activityIdInDrawer).toBeNull();
    expect(result.current.viewableActivityId).toBeNull();
    act(() => {
      result.current.openActivityRightDrawer('123');
    });
    expect(result.current.activityIdInDrawer).toBe('123');
    expect(result.current.viewableActivityId).toBe('123');
  });
});
