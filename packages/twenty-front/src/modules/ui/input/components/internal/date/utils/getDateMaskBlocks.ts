import { IMask } from 'react-imask';

import { type CalendarSystem } from '@/localization/constants/CalendarSystem';
import { MAX_DATE } from '@/ui/input/components/internal/date/constants/MaxDate';
import { MIN_DATE } from '@/ui/input/components/internal/date/constants/MinDate';
import { turnJSDateToPlainDate } from 'twenty-shared/utils';

export const getDateMaskBlocks = (calendarSystem: CalendarSystem) => ({
  Y: {
    mask: IMask.MaskedRange,
    from: turnJSDateToPlainDate(MIN_DATE).withCalendar(calendarSystem).year,
    to: turnJSDateToPlainDate(MAX_DATE).withCalendar(calendarSystem).year,
  },
});
