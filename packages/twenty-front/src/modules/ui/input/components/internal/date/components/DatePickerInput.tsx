import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { useEffect, useState } from 'react';
import { useIMask } from 'react-imask';

import { useDateTimeFormat } from '@/localization/hooks/useDateTimeFormat';
import { DATE_BLOCKS } from '@/ui/input/components/internal/date/constants/DateBlocks';
import { MAX_DATE } from '@/ui/input/components/internal/date/constants/MaxDate';
import { MIN_DATE } from '@/ui/input/components/internal/date/constants/MinDate';
import { useParseDateToString } from '@/ui/input/components/internal/date/hooks/useParseDateToString';
import { useParseStringToDate } from '@/ui/input/components/internal/date/hooks/useParseStringToDate';
import { getDateMask } from '@/ui/input/components/internal/date/utils/getDateMask';
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

type DatePickerInputProps = {
  onChange?: (date: string | null) => void;
  valueFromProps: string | null;
};

export const DatePickerInput = ({
  valueFromProps,
  onChange,
}: DatePickerInputProps) => {
  const { dateFormat } = useDateTimeFormat();

  const [hasError, setHasError] = useState(false);

  const { parseStringToDate } = useParseStringToDate();
  const { parseDateToString } = useParseDateToString();

  const handleParseStringToDate = (newDateAsString: string) => {
    const date = parseStringToDate(newDateAsString);

    setHasError(isNull(date) === true);

    return date;
  };

  const pattern = getDateMask(dateFormat);
  const blocks = DATE_BLOCKS;

  const { ref, setValue, value } = useIMask(
    {
      pattern,
      blocks,
      min: MIN_DATE,
      max: MAX_DATE,
      format: (date: any) => parseDateToString(date),
      parse: handleParseStringToDate,
      lazy: false,
      autofix: true,
    },
    {
      onComplete: (newValue) => {
        console.log({ newValue });

        const parsedDate = parseStringToDate(newValue);

        console.log({ parsedDate });

        onChange?.(parsedDate);
      },
      onAccept: () => {
        setHasError(false);
      },
    },
  );

  useEffect(() => {
    if (!isDefined(valueFromProps)) {
      return;
    }

    setValue(parseDateToString(valueFromProps));
  }, [valueFromProps, setValue, parseDateToString]);

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
