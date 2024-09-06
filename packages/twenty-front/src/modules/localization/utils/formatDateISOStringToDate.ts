import { DateFormat } from '@/localization/constants/DateFormat';
import { formatInTimeZone } from 'date-fns-tz';
import { ptBR } from 'date-fns/locale';

export const formatDateISOStringToDate = (
  date: string,
  timeZone: string,
  dateFormat: DateFormat,
) => {
  return formatInTimeZone(new Date(date), timeZone, `${dateFormat}`, { locale: ptBR });
};
