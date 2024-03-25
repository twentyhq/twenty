import { act, renderHook } from '@testing-library/react';
import { RecoilRoot, useRecoilValue } from 'recoil';

import { useOpenCalendarEventRightDrawer } from '@/activities/calendar/right-drawer/hooks/useOpenCalendarEventRightDrawer';
import { viewableCalendarEventIdState } from '@/activities/calendar/states/viewableCalendarEventIdState';
import { isRightDrawerOpenState } from '@/ui/layout/right-drawer/states/isRightDrawerOpenState';

describe('useOpenCalendarEventRightDrawer', () => {
  it('opens the right drawer with the calendar event', () => {
    const { result } = renderHook(
      () => {
        const isRightDrawerOpen = useRecoilValue(isRightDrawerOpenState);
        const viewableCalendarEventId = useRecoilValue(
          viewableCalendarEventIdState,
        );
        return {
          ...useOpenCalendarEventRightDrawer(),
          isRightDrawerOpen,
          viewableCalendarEventId,
        };
      },
      { wrapper: RecoilRoot },
    );

    expect(result.current.isRightDrawerOpen).toBe(false);
    expect(result.current.viewableCalendarEventId).toBeNull();

    act(() => {
      result.current.openCalendarEventRightDrawer('1234');
    });

    expect(result.current.isRightDrawerOpen).toBe(true);
    expect(result.current.viewableCalendarEventId).toBe('1234');
  });
});
