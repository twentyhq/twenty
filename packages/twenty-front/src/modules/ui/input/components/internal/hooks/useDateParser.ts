import { dateTimeFormatState } from '@/localization/states/dateTimeFormatState';
import { UserContext } from '@/users/contexts/UserContext';
import { useCallback, useContext } from 'react';
import { useRecoilValue } from 'recoil';
import { parseDateToString } from '../date/utils/parseDateToString';
import { parseStringToDate } from '../date/utils/parseStringToDate';

type UseDateParserProps = {
  isDateTimeInput: boolean;
};

export const useDateParser = ({ isDateTimeInput }: UseDateParserProps) => {
  const { dateFormat } = useRecoilValue(dateTimeFormatState);
  const { timeZone } = useContext(UserContext);

  const parseToString = useCallback(
    (date: Date) => {
      return parseDateToString({
        date,
        isDateTimeInput,
        userTimezone: timeZone,
        dateFormat,
      });
    },
    [dateFormat, isDateTimeInput, timeZone],
  );

  const parseToDate = useCallback(
    (dateAsString: string) => {
      return parseStringToDate({
        dateAsString,
        isDateTimeInput,
        userTimezone: timeZone,
        dateFormat,
      });
    },
    [dateFormat, isDateTimeInput, timeZone],
  );

  return {
    parseToString,
    parseToDate,
  };
};
