import { ReactNode } from 'react';
import { MockedProvider } from '@apollo/client/testing';
import { act, renderHook } from '@testing-library/react';
import { RecoilRoot, useRecoilValue } from 'recoil';

import { useOpenActivityRightDrawer } from '@/activities/hooks/useOpenActivityRightDrawer';
import { activityIdInDrawerState } from '@/activities/states/activityIdInDrawerState';
import { viewableRecordIdState } from '@/object-record/record-right-drawer/states/viewableRecordIdState';

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
        const viewableRecordId = useRecoilValue(viewableRecordIdState);
        const activityIdInDrawer = useRecoilValue(activityIdInDrawerState);
        return {
          openActivityRightDrawer,
          activityIdInDrawer,
          viewableRecordId,
        };
      },
      {
        wrapper: Wrapper,
      },
    );

    expect(result.current.activityIdInDrawer).toBeNull();
    expect(result.current.viewableRecordId).toBeNull();
    act(() => {
      result.current.openActivityRightDrawer('123');
    });
    expect(result.current.activityIdInDrawer).toBe('123');
    expect(result.current.viewableRecordId).toBe('123');
  });
});
