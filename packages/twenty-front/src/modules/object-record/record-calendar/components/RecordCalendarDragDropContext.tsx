import { t } from '@lingui/core/macro';
import { useStore } from 'jotai';
import type { ReactNode } from 'react';
import { Temporal } from 'temporal-polyfill';
import { useToast } from 'twenty-ui/components/feedback';

import { RecordCalendarCardDragOverlayContent } from '@/object-record/record-calendar/record-calendar-card/components/RecordCalendarCardDragOverlayContent';
import { calendarDayRecordIdsComponentFamilySelector } from '@/object-record/record-calendar/states/selectors/calendarDayRecordsComponentFamilySelector';
import { RecordDragDropContextProvider } from '@/object-record/record-drag/components/RecordDragDropContextProvider';
import { useProcessCalendarCardDrop } from '@/object-record/record-drag/hooks/useProcessCalendarCardDrop';
import { useUserTimezone } from '@/ui/input/components/internal/date/hooks/useUserTimezone';
import { useAtomComponentFamilySelectorCallbackState } from '@/ui/utilities/state/jotai/hooks/useAtomComponentFamilySelectorCallbackState';
import { logError } from '~/utils/logError';

type RecordCalendarDragDropContextProps = {
  children: ReactNode;
};

export const RecordCalendarDragDropContext = ({
  children,
}: RecordCalendarDragDropContextProps) => {
  const store = useStore();

  const { userTimezone } = useUserTimezone();

  const { enqueueToast } = useToast();

  const calendarDayRecordIdsSelector =
    useAtomComponentFamilySelectorCallbackState(
      calendarDayRecordIdsComponentFamilySelector,
    );

  const { processCalendarCardDrop } = useProcessCalendarCardDrop();

  return (
    <RecordDragDropContextProvider
      getDroppableItemCount={(droppableId) =>
        store.get(
          calendarDayRecordIdsSelector({
            day: Temporal.PlainDate.from(droppableId),
            timeZone: userTimezone,
          }),
        ).length
      }
      onRecordDrop={(result) => {
        void processCalendarCardDrop(result).catch((error) => {
          logError(error);
          enqueueToast({
            variant: 'error',
            children: t`Failed to move record`,
          });
        });
      }}
      renderDragOverlay={(source) => (
        <RecordCalendarCardDragOverlayContent source={source} />
      )}
    >
      {children}
    </RecordDragDropContextProvider>
  );
};
