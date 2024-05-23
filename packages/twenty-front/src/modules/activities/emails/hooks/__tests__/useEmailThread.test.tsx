import { act, renderHook } from '@testing-library/react';
import { RecoilRoot, useRecoilState, useRecoilValue } from 'recoil';

import { useEmailThread } from '@/activities/emails/hooks/useEmailThread';
import { viewableRecordIdState } from '@/object-record/record-right-drawer/states/viewableRecordIdState';
import { isRightDrawerOpenState } from '@/ui/layout/right-drawer/states/isRightDrawerOpenState';

const viewableEmailThreadId = '1234';

describe('useEmailThread', () => {
  it('should open email thread', () => {
    const { result } = renderHook(
      () => {
        const emailThread = useEmailThread();
        const isRightDrawerOpen = useRecoilValue(isRightDrawerOpenState);
        const viewableRecordId = useRecoilValue(viewableRecordIdState);

        return { ...emailThread, isRightDrawerOpen, viewableRecordId };
      },
      { wrapper: RecoilRoot },
    );

    expect(result.current.isRightDrawerOpen).toBe(false);
    expect(result.current.viewableRecordId).toBeNull();

    act(() => {
      result.current.openEmailThread(viewableEmailThreadId);
    });

    expect(result.current.isRightDrawerOpen).toBe(true);
    expect(result.current.viewableRecordId).toBe(viewableEmailThreadId);
  });

  it('should close email thread if trying to open the same thread id', () => {
    const { result } = renderHook(
      () => {
        const emailThread = useEmailThread();
        const [isRightDrawerOpen, setIsRightDrawerOpen] = useRecoilState(
          isRightDrawerOpenState,
        );
        const [viewableRecordId, setViewableRecordId] = useRecoilState(
          viewableRecordIdState,
        );

        return {
          ...emailThread,
          isRightDrawerOpen,
          viewableRecordId,
          setIsRightDrawerOpen,
          setViewableRecordId,
        };
      },
      { wrapper: RecoilRoot },
    );

    act(() => {
      result.current.setIsRightDrawerOpen(true);
      result.current.setViewableRecordId(viewableEmailThreadId);
    });

    act(() => {
      result.current.openEmailThread(viewableEmailThreadId);
    });

    expect(result.current.isRightDrawerOpen).toBe(false);
    expect(result.current.viewableRecordId).toBeNull();
  });
});
