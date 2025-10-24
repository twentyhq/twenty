import { useDateTimeFormat } from '@/localization/hooks/useDateTimeFormat';

import { format, parse } from 'date-fns';
import { DATE_TYPE_FORMAT } from 'twenty-shared/constants';
import { date } from 'zod';
import { getDateFormatString } from '~/utils/date-utils';

export const useParsePlainDateToDateInputString = () => {
  const { dateFormat } = useDateTimeFormat();

  const parsePlainDateToDateInputString = (plainDate: string) => {
    const parsingFormat = getDateFormatString(dateFormat);

    const parsedDate = parse(plainDate, DATE_TYPE_FORMAT, new Date());

    console.log({
      parsingFormat,
      plainDate,
      parsedDate,
      date,
    });

    const formattedDate = format(parsedDate, parsingFormat);

    console.log({
      parsingFormat,
      plainDate,
      parsedDate,
      date,
      formattedDate,
    });

    return formattedDate;
  };

  return {
    parsePlainDateToDateInputString,
  };
};
