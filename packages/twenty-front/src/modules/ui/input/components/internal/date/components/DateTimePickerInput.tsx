import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { useContext, useEffect, useState } from 'react';
import { useIMask } from 'react-imask';

import { useDateTimeFormat } from '@/localization/hooks/useDateTimeFormat';
import { DATE_TIME_BLOCKS } from '@/ui/input/components/internal/date/constants/DateTimeBlocks';
import { MAX_DATE } from '@/ui/input/components/internal/date/constants/MaxDate';
import { MIN_DATE } from '@/ui/input/components/internal/date/constants/MinDate';
import { getDateTimeMask } from '@/ui/input/components/internal/date/utils/getDateTimeMask';

import { useParseDateTimeToString } from '@/ui/input/components/internal/date/hooks/useParseDateTimeToString';
import { useParseStringToDateTime } from '@/ui/input/components/internal/date/hooks/useParseStringToDateTime';
import { UserContext } from '@/users/contexts/UserContext';
import { isNull } from '@sniptt/guards';

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

type DateTimePickerInputProps = {
  onChange?: (date: Date | null) => void;
  date: Date | null;
};

export const DateTimePickerInput = ({
  date,
  onChange,
}: DateTimePickerInputProps) => {
  const [hasError, setHasError] = useState(false);
  const { dateFormat } = useDateTimeFormat();
  const { timeZone } = useContext(UserContext);

  const { parseStringToDateTime } = useParseStringToDateTime();
  const { parseDateTimeToString } = useParseDateTimeToString();

  console.log('DateTimePickerInput', { date });

  const handleParseStringToDate = (newDateAsString: string) => {
    const date = parseStringToDateTime(newDateAsString);

    console.log({
      newDateAsString,
      date,
    });

    setHasError(isNull(date) === true);

    // if (isDefined(date)) {
    //   onChange?.(date);
    // }

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
      format: (date: any) => parseDateTimeToString(date),
      parse: handleParseStringToDate,
      lazy: false,
      autofix: true,
    },
    {
      onComplete: (value) => {
        const parsedDate = parseStringToDateTime(value);

        console.log({
          value,
          parsedDate,
        });

        // onChange?.(parsedDate);
      },
      onAccept: (newValue) => {
        console.log('accept', newValue);
        setHasError(false);
      },
    },
  );

  useEffect(() => {
    if (!isDefined(date)) {
      return;
    }

    setValue(parseDateTimeToString(date));
  }, [date, setValue, parseDateTimeToString]);

  return (
    <StyledInputContainer>
      <StyledInput
        type="text"
        ref={ref as any}
        // value={value}
        // onChange={() => {}} // Prevent React warning
        // hasError={hasError}
      />
    </StyledInputContainer>
  );
};
