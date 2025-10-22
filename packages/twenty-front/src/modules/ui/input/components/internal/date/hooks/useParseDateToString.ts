import { useDateTimeFormat } from '@/localization/hooks/useDateTimeFormat';
import { format, parse } from 'date-fns';
import { DATE_TYPE_FORMAT } from 'twenty-shared/constants';
import { getDateFormatString } from '~/utils/date-utils';

export const useParseDateToString = () => {
  const { dateFormat } = useDateTimeFormat();

  const parseDateToString = (date: string) => {
    const parsingFormat = getDateFormatString(dateFormat);

    const parsedDate = parse(date, DATE_TYPE_FORMAT, new Date());

    console.log({ parsedDate });

    return format(parsedDate, parsingFormat);
  };

  return {
    parseDateToString,
  };
};
