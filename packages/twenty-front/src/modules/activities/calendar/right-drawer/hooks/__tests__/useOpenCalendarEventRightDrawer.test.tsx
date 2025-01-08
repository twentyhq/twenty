import { act, renderHook } from '@testing-library/react';
import { RecoilRoot, useRecoilValue } from 'recoil';

import { useOpenCalendarEventRightDrawer } from '@/activities/calendar/right-drawer/hooks/useOpenCalendarEventRightDrawer';
import { viewableRecordIdState } from '@/object-record/record-right-drawer/states/viewableRecordIdState';
import { isRightDrawerOpenState } from '@/ui/layout/right-drawer/states/isRightDrawerOpenState';
import { ReactNode } from 'react';
import { BrowserRouter } from 'react-router-dom';

describe('useOpenCalendarEventRightDrawer', () => {
  it('opens the right drawer with the calendar event', () => {
    const { result } = renderHook(
      () => {
        const isRightDrawerOpen = useRecoilValue(isRightDrawerOpenState);
        const viewableRecordId = useRecoilValue(viewableRecordIdState);
        return {
          ...useOpenCalendarEventRightDrawer(),
          isRightDrawerOpen,
          viewableRecordId,
        };
      },
      {
        wrapper: ({ children }: { children: ReactNode }) => (
          <BrowserRouter>
            <RecoilRoot>{children}</RecoilRoot>
          </BrowserRouter>
        ),
      },
    );

    expect(result.current.isRightDrawerOpen).toBe(false);
    expect(result.current.viewableRecordId).toBeNull();

    act(() => {
      result.current.openCalendarEventRightDrawer('1234');
    });

    expect(result.current.isRightDrawerOpen).toBe(true);
    expect(result.current.viewableRecordId).toBe('1234');
  });
});
