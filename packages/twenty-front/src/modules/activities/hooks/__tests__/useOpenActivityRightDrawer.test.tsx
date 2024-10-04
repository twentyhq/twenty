import { MockedProvider } from '@apollo/client/testing';
import { act, renderHook } from '@testing-library/react';
import { ReactNode } from 'react';
import { RecoilRoot, useRecoilValue } from 'recoil';

import { useOpenActivityRightDrawer } from '@/activities/hooks/useOpenActivityRightDrawer';
import { CoreObjectNameSingular } from '@/object-metadata/types/CoreObjectNameSingular';
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
        const openActivityRightDrawer = useOpenActivityRightDrawer({
          objectNameSingular: CoreObjectNameSingular.Task,
        });
        const viewableRecordId = useRecoilValue(viewableRecordIdState);
        return {
          openActivityRightDrawer,
          viewableRecordId,
        };
      },
      {
        wrapper: Wrapper,
      },
    );

    expect(result.current.viewableRecordId).toBeNull();
    act(() => {
      result.current.openActivityRightDrawer('123');
    });
    expect(result.current.viewableRecordId).toBe('123');
  });
});
