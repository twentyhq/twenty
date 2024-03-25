import { act, renderHook } from '@testing-library/react';
import { RecoilRoot, useRecoilState, useRecoilValue } from 'recoil';

import { useEmailThread } from '@/activities/emails/hooks/useEmailThread';
import { viewableEmailThreadIdState } from '@/activities/emails/states/viewableEmailThreadIdState';
import { isRightDrawerOpenState } from '@/ui/layout/right-drawer/states/isRightDrawerOpenState';

const viewableEmailThreadId = '1234';

describe('useEmailThread', () => {
  it('should open email thread', () => {
    const { result } = renderHook(
      () => {
        const emailThread = useEmailThread();
        const isRightDrawerOpen = useRecoilValue(isRightDrawerOpenState);
        const viewableEmailThreadId = useRecoilValue(
          viewableEmailThreadIdState,
        );

        return { ...emailThread, isRightDrawerOpen, viewableEmailThreadId };
      },
      { wrapper: RecoilRoot },
    );

    expect(result.current.isRightDrawerOpen).toBe(false);
    expect(result.current.viewableEmailThreadId).toBeNull();

    act(() => {
      result.current.openEmailThread(viewableEmailThreadId);
    });

    expect(result.current.isRightDrawerOpen).toBe(true);
    expect(result.current.viewableEmailThreadId).toBe(viewableEmailThreadId);
  });

  it('should close email thread if trying to open the same thread id', () => {
    const { result } = renderHook(
      () => {
        const emailThread = useEmailThread();
        const [isRightDrawerOpen, setIsRightDrawerOpen] = useRecoilState(
          isRightDrawerOpenState,
        );
        const [viewableEmailThreadId, setViewableEmailThreadId] =
          useRecoilState(viewableEmailThreadIdState);

        return {
          ...emailThread,
          isRightDrawerOpen,
          viewableEmailThreadId,
          setIsRightDrawerOpen,
          setViewableEmailThreadId,
        };
      },
      { wrapper: RecoilRoot },
    );

    act(() => {
      result.current.setIsRightDrawerOpen(true);
      result.current.setViewableEmailThreadId(viewableEmailThreadId);
    });

    act(() => {
      result.current.openEmailThread(viewableEmailThreadId);
    });

    expect(result.current.isRightDrawerOpen).toBe(false);
    expect(result.current.viewableEmailThreadId).toBeNull();
  });
});
