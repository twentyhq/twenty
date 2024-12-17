import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { useCallback, useEffect, useState } from 'react';
import { useIMask } from 'react-imask';

import { DATE_BLOCKS } from '@/ui/input/components/internal/date/constants/DateBlocks';
import { DATE_MASK } from '@/ui/input/components/internal/date/constants/DateMask';
import { DATE_TIME_BLOCKS } from '@/ui/input/components/internal/date/constants/DateTimeBlocks';
import { DATE_TIME_MASK } from '@/ui/input/components/internal/date/constants/DateTimeMask';
import { MAX_DATE } from '@/ui/input/components/internal/date/constants/MaxDate';
import { MIN_DATE } from '@/ui/input/components/internal/date/constants/MinDate';
import { parseDateToString } from '@/ui/input/components/internal/date/utils/parseDateToString';
import { parseStringToDate } from '@/ui/input/components/internal/date/utils/parseStringToDate';
import { isNull } from '@sniptt/guards';
import { isDefined } from 'twenty-ui';

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
  const [hasError, setHasError] = useState(false);

  const handleParseDateToString = useCallback(
    (date: any) => {
      return parseDateToString({
        date,
        isDateTimeInput: isDateTimeInput === true,
        userTimezone,
      });
    },
    [isDateTimeInput, userTimezone],
  );

  const handleParseStringToDate = (str: string) => {
    const date = parseStringToDate({
      dateAsString: str,
      isDateTimeInput: isDateTimeInput === true,
      userTimezone,
    });

    setHasError(isNull(date) === true);

    return date;
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
      format: handleParseDateToString,
      parse: handleParseStringToDate,
      lazy: false,
      autofix: true,
    },
    {
      onComplete: (value) => {
        const parsedDate = parseStringToDate({
          dateAsString: value,
          isDateTimeInput: isDateTimeInput === true,
          userTimezone,
        });

        onChange?.(parsedDate);
      },
      onAccept: () => {
        setHasError(false);
      },
    },
  );

  useEffect(() => {
    if (!isDefined(date)) {
      return;
    }

    setValue(
      parseDateToString({
        date: date,
        isDateTimeInput: isDateTimeInput === true,
        userTimezone,
      }),
    );
  }, [date, setValue, isDateTimeInput, userTimezone]);

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
