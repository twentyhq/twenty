import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { useEffect, useState } from 'react';
import { useIMask } from 'react-imask';

import { useDateTimeFormat } from '@/localization/hooks/useDateTimeFormat';
import { DATE_BLOCKS } from '@/ui/input/components/internal/date/constants/DateBlocks';
import { MAX_DATE } from '@/ui/input/components/internal/date/constants/MaxDate';
import { MIN_DATE } from '@/ui/input/components/internal/date/constants/MinDate';
import { useParseDateInputStringToJSDate } from '@/ui/input/components/internal/date/hooks/useParseDateInputStringToJSDate';
import { useParsePlainDateToDateInputString } from '@/ui/input/components/internal/date/hooks/useParsePlainDateToDateInputString';
import { getDateMask } from '@/ui/input/components/internal/date/utils/getDateMask';

import { useParseDateInputStringToPlainDate } from '@/ui/input/components/internal/date/hooks/useParseDateInputStringToPlainDate';
import { useParseJSDateToIMaskDateInputString } from '@/ui/input/components/internal/date/hooks/useParseJSDateToIMaskDateInputString';
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

type DatePickerInputProps = {
  onChange?: (date: string | null) => void;
  date: string | null;
};

export const DatePickerInput = ({ date, onChange }: DatePickerInputProps) => {
  const { dateFormat } = useDateTimeFormat();

  const [internalDate, setInternalDate] = useState(date);

  const { parseDateInputStringToPlainDate } =
    useParseDateInputStringToPlainDate();
  const { parseDateInputStringToJSDate } = useParseDateInputStringToJSDate();
  const { parsePlainDateToDateInputString } =
    useParsePlainDateToDateInputString();

  const { parseIMaskJSDateIMaskDateInputString } =
    useParseJSDateToIMaskDateInputString();

  const parseIMaskDateInputStringToJSDate = (newDateAsString: string) => {
    const newDate = parseDateInputStringToJSDate(newDateAsString);

    return newDate;
  };

  const pattern = getDateMask(dateFormat);
  const blocks = DATE_BLOCKS;

  const defaultValue = internalDate
    ? (parsePlainDateToDateInputString(internalDate) ?? undefined)
    : undefined;

  const { ref, setValue, value } = useIMask(
    {
      mask: Date,
      pattern,
      blocks,
      min: MIN_DATE,
      max: MAX_DATE,
      format: (date: any) =>
        isDefined(date) ? parseIMaskJSDateIMaskDateInputString(date) : '',
      parse: parseIMaskDateInputStringToJSDate,
      lazy: false,
      autofix: true,
    },
    {
      defaultValue,
      onComplete: (newValue) => {
        const parsedDate = parseDateInputStringToPlainDate(newValue);

        onChange?.(parsedDate);
      },
    },
  );

  useEffect(() => {
    if (isDefined(date) && internalDate !== date) {
      setInternalDate(date);
      setValue(parsePlainDateToDateInputString(date));
    }
  }, [date, internalDate, parsePlainDateToDateInputString, setValue]);

  return (
    <StyledInputContainer>
      <StyledInput
        type="text"
        ref={ref as any}
        value={value}
        onChange={() => {}} // Prevent React warning
      />
    </StyledInputContainer>
  );
};
