import { useEffect, useState } from 'react';
import { useIMask } from 'react-imask';
import styled from '@emotion/styled';
import { DateTime } from 'luxon';

import { DATE_TIME_BLOCKS } from '@/ui/input/components/internal/date/constants/DateTimeBlocks';
import { DATE_TIME_MASK } from '@/ui/input/components/internal/date/constants/DateTimeMask';

const StyledInputContainer = styled.div`
  width: 100%;
  display: flex;
  border-bottom: 1px solid ${({ theme }) => theme.border.color.light};
  height: ${({ theme }) => theme.spacing(8)};
`;

const StyledInput = styled.input<{ hasError?: boolean }>`
  background: ${({ theme }) => theme.background.secondary};
  border: none;
  color: ${({ theme }) => theme.font.color.primary};
  outline: none;
  padding: 8px;
  font-weight: 500;
  font-size: ${({ theme }) => theme.font.size.md};
  width: 100%;
  color: ${({ hasError, theme }) => (hasError ? theme.color.red : 'inherit')};
`;

type DateTimeInputProps = {
  onChange?: (date: Date | null) => void;
  date: Date | null;
  isDateTimeInput?: boolean;
  onError?: (error: Error) => void;
};

export const DateTimeInput = ({
  date,
  onChange,
  isDateTimeInput,
  onError,
}: DateTimeInputProps) => {
  const [hasError, setHasError] = useState(false);

  const parseDateToString = (date: any) => {
    console.log({ date });

    const dateParsed = DateTime.fromJSDate(date);

    const formattedDate = dateParsed.toFormat('MM/dd/yyyy HH:mm');

    console.log({ formattedDate });

    return formattedDate;
  };

  const parseStringToDate = (str: string) => {
    setHasError(false);
    console.log({ str });

    const parsedDate = DateTime.fromFormat(str, 'MM/dd/yyyy HH:mm');

    const isValid = parsedDate.isValid;

    if (!isValid) {
      setHasError(true);

      return null;
    }

    const jsDate = parsedDate.toJSDate();

    return jsDate;
  };

  const { ref, setValue, value, unmaskedValue, typedValue, maskRef } = useIMask(
    {
      mask: Date,
      pattern: DATE_TIME_MASK,
      blocks: DATE_TIME_BLOCKS,
      min: new Date(1970, 0, 1),
      max: new Date(2100, 0, 1),
      format: parseDateToString,
      parse: parseStringToDate,
      lazy: false,
      autofix: true,
    },
    {
      onComplete: (value) => {
        console.log({
          value,
        });

        const parsedDate = parseStringToDate(value);

        onChange?.(parsedDate);
      },
      onAccept: (value) => {
        setHasError(false);
        console.log({
          value,
        });
      },
    },
  );

  console.log({
    value,
    unmaskedValue,
    typedValue,
    maskRef: maskRef?.current,
    ref: ref?.current,
  });

  useEffect(() => {
    setValue(parseDateToString(date));
  }, [date, setValue]);

  return (
    <StyledInputContainer>
      <StyledInput
        type="text"
        ref={ref as any}
        placeholder={`Type date${
          isDateTimeInput ? ' and time' : ' (mm/dd/yyyy)'
        }`}
        value={value}
        hasError={hasError}
      />
    </StyledInputContainer>
  );
};
