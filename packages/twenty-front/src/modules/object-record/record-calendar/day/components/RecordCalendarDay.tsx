import { RecordCalendarComponentInstanceContext } from '@/object-record/record-calendar/states/contexts/RecordCalendarComponentInstanceContext';
import { recordCalendarSelectedDateComponentState } from '@/object-record/record-calendar/states/recordCalendarSelectedDateComponentState';
import { RecordCalendarTimeGrid } from '@/object-record/record-calendar/time-grid/components/RecordCalendarTimeGrid';
import { useAvailableComponentInstanceIdOrThrow } from '@/ui/utilities/state/component-state/hooks/useAvailableComponentInstanceIdOrThrow';
import { useAtomComponentStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomComponentStateValue';
import { useAtomStateValue } from '@/ui/utilities/state/jotai/hooks/useAtomStateValue';
import { format } from 'date-fns';
import { turnPlainDateToShiftedDateInSystemTimeZone } from 'twenty-shared/utils';
import { dateLocaleState } from '~/localization/states/dateLocaleState';

export const RecordCalendarDay = () => {
  const recordCalendarId = useAvailableComponentInstanceIdOrThrow(
    RecordCalendarComponentInstanceContext,
  );
  const recordCalendarSelectedDate = useAtomComponentStateValue(
    recordCalendarSelectedDateComponentState,
    recordCalendarId,
  );
  const dateLocale = useAtomStateValue(dateLocaleState);

  return (
    <RecordCalendarTimeGrid
      days={[
        {
          date: recordCalendarSelectedDate,
          label: format(
            turnPlainDateToShiftedDateInSystemTimeZone(
              recordCalendarSelectedDate,
            ),
            'EEE',
            { locale: dateLocale.localeCatalog },
          ),
        },
      ]}
    />
  );
};
