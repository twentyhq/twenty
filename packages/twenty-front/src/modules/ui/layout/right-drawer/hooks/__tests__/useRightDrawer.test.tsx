import { act } from 'react-dom/test-utils';
import { renderHook } from '@testing-library/react';
import { RecoilRoot, useRecoilValue } from 'recoil';

import { isRightDrawerExpandedState } from '../../states/isRightDrawerExpandedState';
import { isRightDrawerOpenState } from '../../states/isRightDrawerOpenState';
import { rightDrawerPageState } from '../../states/rightDrawerPageState';
import { RightDrawerPages } from '../../types/RightDrawerPages';
import { useRightDrawer } from '../useRightDrawer';

describe('useRightDrawer', () => {
  it('Should test the default behavior of useRightDrawer and change the states as the function calls', async () => {
    const useCombinedHooks = () => {
      const { openRightDrawer, closeRightDrawer } = useRightDrawer();
      const isRightDrawerOpen = useRecoilValue(isRightDrawerOpenState);
      const isRightDrawerExpanded = useRecoilValue(isRightDrawerExpandedState);

      const rightDrawerPage = useRecoilValue(rightDrawerPageState);

      return {
        openRightDrawer,
        closeRightDrawer,
        isRightDrawerOpen,
        isRightDrawerExpanded,
        rightDrawerPage,
      };
    };

    const { result } = renderHook(() => useCombinedHooks(), {
      wrapper: RecoilRoot,
    });

    expect(result.current.rightDrawerPage).toBeNull();
    expect(result.current.isRightDrawerExpanded).toBeFalsy();
    expect(result.current.isRightDrawerOpen).toBeFalsy();
    expect(result.current.openRightDrawer).toBeInstanceOf(Function);
    expect(result.current.closeRightDrawer).toBeInstanceOf(Function);

    await act(async () => {
      result.current.openRightDrawer(RightDrawerPages.CreateActivity);
    });

    expect(result.current.rightDrawerPage).toEqual(
      RightDrawerPages.CreateActivity,
    );
    expect(result.current.isRightDrawerExpanded).toBeFalsy();
    expect(result.current.isRightDrawerOpen).toBeTruthy();

    await act(async () => {
      result.current.closeRightDrawer();
    });

    expect(result.current.isRightDrawerExpanded).toBeFalsy();
    expect(result.current.isRightDrawerOpen).toBeFalsy();
  });
});
