import styled from '@emotion/styled';
import { useIMask } from 'react-imask';

import { useDateTimeFormat } from '@/localization/hooks/useDateTimeFormat';
import { DATE_TIME_BLOCKS } from '@/ui/input/components/internal/date/constants/DateTimeBlocks';
import { MAX_DATE } from '@/ui/input/components/internal/date/constants/MaxDate';
import { MIN_DATE } from '@/ui/input/components/internal/date/constants/MinDate';
import { getDateTimeMask } from '@/ui/input/components/internal/date/utils/getDateTimeMask';

import { TimeZoneAbbreviation } from '@/ui/input/components/internal/date/components/TimeZoneAbbreviation';
import { useGetShiftedDateToCustomTimeZone } from '@/ui/input/components/internal/date/hooks/useGetShiftedDateToCustomTimeZone';
import { useGetShiftedDateToSystemTimeZone } from '@/ui/input/components/internal/date/hooks/useGetShiftedDateToSystemTimeZone';
import { useParseDateTimeInputStringToJSDate } from '@/ui/input/components/internal/date/hooks/useParseDateTimeInputStringToJSDate';
import { useParseJSDateToIMaskDateTimeInputString } from '@/ui/input/components/internal/date/hooks/useParseJSDateToIMaskDateTimeInputString';
import { useUserTimezone } from '@/ui/input/components/internal/date/hooks/useUserTimezone';
import { useEffect, useState } from 'react';
import { Temporal } from 'temporal-polyfill';
import { isDefined } from 'twenty-shared/utils';
import { isDifferentZonedDateTime } from '~/utils/dates/isDifferentZonedDateTime';

const StyledInputContainer = styled.div`
  align-items: center;

  border-top-left-radius: ${({ theme }) => theme.border.radius.md};
  border-top-right-radius: ${({ theme }) => theme.border.radius.md};
  display: flex;
  height: ${({ theme }) => theme.spacing(8)};
  width: 100%;
`;

const StyledInput = styled.input<{ hasError?: boolean }>`
  background: transparent;
  border: none;
  color: ${({ theme }) => theme.font.color.primary};
  outline: none;
  padding-left: ${({ theme }) => theme.spacing(2)};
  font-weight: 500;
  font-size: ${({ theme }) => theme.font.size.md};
  width: 105px;
`;

type DateTimePickerInputProps = {
  onChange?: (date: Temporal.ZonedDateTime | null) => void;
  date: Temporal.ZonedDateTime | null;
  onFocus?: () => void;
  readonly?: boolean;
  timeZone?: string;
};

export const DateTimePickerInput = ({
  date,
  onChange,
  onFocus,
  readonly,
  timeZone,
}: DateTimePickerInputProps) => {
  const [internalDate, setInternalDate] = useState(date);

  const { userTimezone } = useUserTimezone();

  const { dateFormat } = useDateTimeFormat();

  const { getShiftedDateToSystemTimeZone } =
    useGetShiftedDateToSystemTimeZone();

  const { getShiftedDateToCustomTimeZone } =
    useGetShiftedDateToCustomTimeZone();

  const { parseDateTimeInputStringToJSDate } =
    useParseDateTimeInputStringToJSDate();
  const { parseJSDateToDateTimeInputString } =
    useParseJSDateToIMaskDateTimeInputString();

  const handleParseStringToDate = (newDateAsString: string) => {
    const date = parseDateTimeInputStringToJSDate(newDateAsString);

    return date;
  };

  const pattern = getDateTimeMask(dateFormat);

  const blocks = DATE_TIME_BLOCKS;

  const defaultValueForIMask = isDefined(internalDate)
    ? new Date(internalDate?.toInstant().toString())
    : null;

  const shiftedIMaskDate = isDefined(defaultValueForIMask)
    ? getShiftedDateToSystemTimeZone(
        defaultValueForIMask,
        timeZone ?? userTimezone,
      )
    : null;

  const { ref, setValue } = useIMask(
    {
      mask: Date,
      pattern,
      blocks,
      min: MIN_DATE,
      max: MAX_DATE,
      format: (date: any) => parseJSDateToDateTimeInputString(date),
      parse: handleParseStringToDate,
      lazy: false,
      autofix: false,
    },
    {
      defaultValue: isDefined(shiftedIMaskDate)
        ? parseJSDateToDateTimeInputString(shiftedIMaskDate)
        : undefined,
      onComplete: (value) => {
        const parsedDate = parseDateTimeInputStringToJSDate(value);

        if (!isDefined(parsedDate)) {
          return;
        }

        const pointInTime = getShiftedDateToCustomTimeZone(
          parsedDate,
          timeZone ?? userTimezone,
        );

        setInternalDate(date);

        const zonedDateTime = Temporal.Instant.from(
          pointInTime.toISOString(),
        ).toZonedDateTimeISO(timeZone ?? userTimezone);

        onChange?.(zonedDateTime);
      },
    },
  );

  useEffect(() => {
    if (isDifferentZonedDateTime(internalDate, date)) {
      setInternalDate(date);

      if (!isDefined(date)) {
        return;
      }

      const newDateAsDate = new Date(date.toInstant().toString());

      const newShiftedDate = getShiftedDateToSystemTimeZone(
        newDateAsDate,
        timeZone ?? userTimezone,
      );

      setValue(parseJSDateToDateTimeInputString(newShiftedDate));
    }
  }, [
    date,
    internalDate,
    parseJSDateToDateTimeInputString,
    setValue,
    shiftedIMaskDate,
    timeZone,
    getShiftedDateToSystemTimeZone,
    userTimezone,
  ]);

  const shouldDisplayReadOnly = readonly === true;

  const internalDateForTimeZoneAbbreviation =
    internalDate?.toInstant() ?? Temporal.Now.instant();

  return (
    <StyledInputContainer>
      <StyledInput
        disabled={shouldDisplayReadOnly}
        type="text"
        ref={ref as any}
        onFocus={!shouldDisplayReadOnly ? onFocus : undefined}
      />
      <TimeZoneAbbreviation
        instant={internalDateForTimeZoneAbbreviation}
        timeZone={timeZone ?? userTimezone}
      />
    </StyledInputContainer>
  );
};
