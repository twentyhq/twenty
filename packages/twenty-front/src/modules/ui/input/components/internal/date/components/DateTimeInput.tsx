import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { DateTime } from 'luxon';
import { useCallback, useEffect, useState } from 'react';
import { useIMask } from 'react-imask';

import { DATE_BLOCKS } from '@/ui/input/components/internal/date/constants/DateBlocks';
import { DATE_MASK } from '@/ui/input/components/internal/date/constants/DateMask';
import { DATE_TIME_BLOCKS } from '@/ui/input/components/internal/date/constants/DateTimeBlocks';
import { DATE_TIME_MASK } from '@/ui/input/components/internal/date/constants/DateTimeMask';
import { MAX_DATE } from '@/ui/input/components/internal/date/constants/MaxDate';
import { MIN_DATE } from '@/ui/input/components/internal/date/constants/MinDate';

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
  background: ${({ theme }) => theme.background.secondary};
  border: none;
  color: ${({ theme }) => theme.font.color.primary};
  outline: none;
  padding: 4px 8px 4px 8px;
  font-weight: 500;
  font-size: ${({ theme }) => theme.font.size.md};
  width: 100%;
  ${({ hasError, theme }) =>
    hasError &&
    css`
      color: ${theme.color.red};
    `};
`;

type DateTimeInputProps = {
  onChange?: (date: Date | null) => void;
  date: Date | null;
  isDateTimeInput?: boolean;
  userTimezone?: string;
  onError?: (error: Error) => void;
};

export const DateTimeInput = ({
  date,
  onChange,
  isDateTimeInput,
  userTimezone,
}: DateTimeInputProps) => {
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
        const parsedDate = parseStringToDate(value);

        onChange?.(parsedDate);
      },
      onAccept: () => {
        setHasError(false);
      },
    },
  );

  useEffect(() => {
    setValue(parseDateToString(date));
  }, [date, setValue, parseDateToString]);

  return (
    <StyledInputContainer>
      <StyledInput
        type="text"
        ref={ref as any}
        placeholder={`Type date${
          isDateTimeInput ? ' and time' : ' (mm/dd/yyyy)'
        }`}
        value={value}
        onChange={() => {}} // Prevent React warning
        hasError={hasError}
      />
    </StyledInputContainer>
  );
};
