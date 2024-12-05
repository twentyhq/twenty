import { DateTime } from 'luxon';
import { useCallback, useEffect, useState } from 'react';
import { useIMask } from 'react-imask';

import { DATE_BLOCKS } from '@/ui/input/components/internal/date/constants/DateBlocks';
import { DATE_MASK } from '@/ui/input/components/internal/date/constants/DateMask';
import { DATE_TIME_BLOCKS } from '@/ui/input/components/internal/date/constants/DateTimeBlocks';
import { DATE_TIME_MASK } from '@/ui/input/components/internal/date/constants/DateTimeMask';
import { MAX_DATE } from '@/ui/input/components/internal/date/constants/MaxDate';
import { MIN_DATE } from '@/ui/input/components/internal/date/constants/MinDate';

type UseDateTimeInputProps = {
  onChange?: (date: Date | null) => void;
  date: Date | null;
  isDateTimeInput?: boolean;
  userTimezone?: string;
  onError?: (error: Error) => void;
};

export const useDateTimeInput = ({
  onChange,
  date,
  isDateTimeInput,
  userTimezone,
  onError,
}: UseDateTimeInputProps) => {
  const parsingFormat = isDateTimeInput ? 'MM/dd/yyyy HH:mm' : 'MM/dd/yyyy';

  const [hasError, setHasError] = useState(false);

  const parseDateToString = useCallback(
    (date: any) => {
      const dateParsed = DateTime.fromJSDate(date, { zone: userTimezone });

      const dateWithoutTime = DateTime.fromJSDate(date)
        .toLocal()
        .set({
          day: date.getUTCDate(),
          month: date.getUTCMonth() + 1,
          year: date.getUTCFullYear(),
          hour: 0,
          minute: 0,
          second: 0,
          millisecond: 0,
        });

      const formattedDate = isDateTimeInput
        ? dateParsed.setZone(userTimezone).toFormat(parsingFormat)
        : dateWithoutTime.toFormat(parsingFormat);

      return formattedDate;
    },
    [parsingFormat, isDateTimeInput, userTimezone],
  );

  const parseStringToDate = (str: string) => {
    setHasError(false);

    const parsedDate = isDateTimeInput
      ? DateTime.fromFormat(str, parsingFormat, { zone: userTimezone })
      : DateTime.fromFormat(str, parsingFormat, { zone: 'utc' });

    const isValid = parsedDate.isValid;

    if (!isValid) {
      setHasError(true);

      return null;
    }

    const jsDate = parsedDate.toJSDate();

    return jsDate;
  };

  const pattern = isDateTimeInput ? DATE_TIME_MASK : DATE_MASK;
  const blocks = isDateTimeInput ? DATE_TIME_BLOCKS : DATE_BLOCKS;

  const { ref, setValue, value } = useIMask(
    {
      mask: Date,
      pattern,
      blocks,
      min: MIN_DATE,
      max: MAX_DATE,
      format: parseDateToString,
      parse: parseStringToDate,
      lazy: false,
      autofix: true,
    },
    {
      onComplete: (value) => {
        console.log('on complete', value);

        const parsedDate = parseStringToDate(value);

        onChange?.(parsedDate);
      },
      onAccept: () => {
        setHasError(false);
      },
    },
  );

  useEffect(() => {
    console.log('set value in hook', date);

    setValue(parseDateToString(date));
  }, [date, setValue, parseDateToString]);

  useEffect(() => {
    console.log('value changed', value);
  }, [value]);

  useEffect(() => {
    console.log('date changed', date);
  }, [date]);

  return {
    ref,
    value,
    hasError,
  };
};
