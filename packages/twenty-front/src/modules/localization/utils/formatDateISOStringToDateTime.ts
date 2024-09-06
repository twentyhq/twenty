import { DateFormat } from '@/localization/constants/DateFormat';
import { TimeFormat } from '@/localization/constants/TimeFormat';
import { formatInTimeZone } from 'date-fns-tz';
import { ptBR } from 'date-fns/locale';

export const formatDateISOStringToDateTime = (
  date: string,
  timeZone: string,
  dateFormat: DateFormat,
  timeFormat: TimeFormat,
) => {
  return formatInTimeZone(
    new Date(date),
    timeZone,
    `${dateFormat} ${timeFormat}`,
    { locale: ptBR },
  );
};
