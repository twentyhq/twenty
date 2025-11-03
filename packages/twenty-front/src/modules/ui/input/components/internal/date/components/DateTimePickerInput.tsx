import styled from '@emotion/styled';
import { useIMask } from 'react-imask';

import { useDateTimeFormat } from '@/localization/hooks/useDateTimeFormat';
import { DATE_TIME_BLOCKS } from '@/ui/input/components/internal/date/constants/DateTimeBlocks';
import { MAX_DATE } from '@/ui/input/components/internal/date/constants/MaxDate';
import { MIN_DATE } from '@/ui/input/components/internal/date/constants/MinDate';
import { getDateTimeMask } from '@/ui/input/components/internal/date/utils/getDateTimeMask';

import { TimeZoneAbbreviation } from '@/ui/input/components/internal/date/components/TimeZoneAbbreviation';
import { useParseDateTimeInputStringToJSDate } from '@/ui/input/components/internal/date/hooks/useParseDateTimeInputStringToJSDate';
import { useParseJSDateToIMaskDateTimeInputString } from '@/ui/input/components/internal/date/hooks/useParseJSDateToIMaskDateTimeInputString';
import { useTurnReactDatePickerShiftedDateBackIntoPointInTime } from '@/ui/input/components/internal/date/hooks/useTurnReactDatePickerShiftedDateBackIntoPointInTime';
import { useEffect, useState } from 'react';
import { isDefined } from 'twenty-shared/utils';

const StyledInputContainer = styled.div`
  align-items: center;
  border-bottom: 1px solid ${({ theme }) => theme.border.color.light};
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
  onChange?: (date: Date | null) => void;
  date: Date | null;
};

export const DateTimePickerInput = ({
  date,
  onChange,
}: DateTimePickerInputProps) => {
  const { turnReactDatePickerShiftedDateBackIntoPointInTime } =
    useTurnReactDatePickerShiftedDateBackIntoPointInTime();

  const [internalDate, setInternalDate] = useState(date);

  const { dateFormat } = useDateTimeFormat();

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
      defaultValue: parseJSDateToDateTimeInputString(
        internalDate ?? new Date(),
      ),
      onComplete: (value) => {
        const parsedDate = parseDateTimeInputStringToJSDate(value);

        if (!isDefined(parsedDate)) {
          return;
        }

        const pointInTime =
          turnReactDatePickerShiftedDateBackIntoPointInTime(parsedDate);

        onChange?.(pointInTime);
      },
    },
  );

  useEffect(() => {
    if (isDefined(date) && internalDate !== date) {
      setInternalDate(date);
      setValue(parseJSDateToDateTimeInputString(date));
    }
  }, [date, internalDate, parseJSDateToDateTimeInputString, setValue]);

  return (
    <StyledInputContainer>
      <StyledInput type="text" ref={ref as any} />
      <TimeZoneAbbreviation date={internalDate ?? new Date()} />
    </StyledInputContainer>
  );
};
