import { dateTimeFormatState } from '@/localization/states/dateTimeFormatState';
import { UserContext } from '@/users/contexts/UserContext';
import { useContext } from 'react';
import { useRecoilValue } from 'recoil';
import { parseDateToString } from '../date/utils/parseDateToString';
import { parseStringToDate } from '../date/utils/parseStringToDate';

type UseDateParserProps = {
  isDateTimeInput: boolean;
};

export const useDateParser = ({ isDateTimeInput }: UseDateParserProps) => {
  const { dateFormat } = useRecoilValue(dateTimeFormatState);
  const { timeZone } = useContext(UserContext);

  const parseToString = (date: Date) => {
    return parseDateToString({
      date,
      isDateTimeInput,
      userTimezone: timeZone,
      dateFormat,
    });
  };

  const parseToDate = (dateAsString: string) => {
    return parseStringToDate({
      dateAsString,
      isDateTimeInput,
      userTimezone: timeZone,
      dateFormat,
    });
  };

  return {
    parseToString,
    parseToDate,
  };
};
