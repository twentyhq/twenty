import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { useEffect, useState } from 'react';
import { useIMask } from 'react-imask';
import { useRecoilValue } from 'recoil';

import { dateTimeFormatState } from '@/localization/states/dateTimeFormatState';
import { DATE_BLOCKS } from '@/ui/input/components/internal/date/constants/DateBlocks';
import { DATE_TIME_BLOCKS } from '@/ui/input/components/internal/date/constants/DateTimeBlocks';
import { MAX_DATE } from '@/ui/input/components/internal/date/constants/MaxDate';
import { MIN_DATE } from '@/ui/input/components/internal/date/constants/MinDate';
import { getDateMask } from '@/ui/input/components/internal/date/utils/getDateMask';
import { getDateTimeMask } from '@/ui/input/components/internal/date/utils/getDateTimeMask';
import { isNull } from '@sniptt/guards';
import { isDefined } from 'twenty-shared/utils';
import { useDateParser } from '../../hooks/useDateParser';

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
};

export const DateTimeInput = ({
  date,
  onChange,
  isDateTimeInput,
}: DateTimeInputProps) => {
  const [hasError, setHasError] = useState(false);
  const { dateFormat } = useRecoilValue(dateTimeFormatState);
  const { parseToString, parseToDate } = useDateParser({
    isDateTimeInput: isDateTimeInput === true,
  });

  const handleParseStringToDate = (str: string) => {
    const date = parseToDate(str);

    setHasError(isNull(date) === true);

    return date;
  };

  const pattern = isDateTimeInput
    ? getDateTimeMask(dateFormat)
    : getDateMask(dateFormat);
  const blocks = isDateTimeInput ? DATE_TIME_BLOCKS : DATE_BLOCKS;

  const { ref, setValue, value } = useIMask(
    {
      mask: Date,
      pattern,
      blocks,
      min: MIN_DATE,
      max: MAX_DATE,
      format: (date: any) => parseToString(date),
      parse: handleParseStringToDate,
      lazy: false,
      autofix: true,
    },
    {
      onComplete: (value) => {
        const parsedDate = parseToDate(value);

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

    setValue(parseToString(date));
  }, [date, setValue, parseToString]);

  return (
    <StyledInputContainer>
      <StyledInput
        type="text"
        ref={ref as any}
        value={value}
        onChange={() => {}} // Prevent React warning
        hasError={hasError}
      />
    </StyledInputContainer>
  );
};
