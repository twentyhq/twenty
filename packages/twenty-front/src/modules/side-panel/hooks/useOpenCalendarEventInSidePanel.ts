import { useOpenRecordInSidePanel } from '@/side-panel/hooks/useOpenRecordInSidePanel';
import { useCallback } from 'react';
import { CoreObjectNameSingular } from 'twenty-shared/types';

export const useOpenCalendarEventInSidePanel = () => {
  const { openRecordInSidePanel } = useOpenRecordInSidePanel();

  const openCalendarEventInSidePanel = useCallback(
    (calendarEventId: string) => {
      openRecordInSidePanel({
        recordId: calendarEventId,
        objectNameSingular: CoreObjectNameSingular.CalendarEvent,
      });
    },
    [openRecordInSidePanel],
  );

  return {
    openCalendarEventInSidePanel,
  };
};
