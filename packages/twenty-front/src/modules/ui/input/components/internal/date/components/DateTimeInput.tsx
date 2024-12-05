import { css } from '@emotion/react';
import styled from '@emotion/styled';

import { useDateTimeInput } from '@/ui/input/components/internal/date/hooks/useDateTimeInput';

const StyledInputContainer = styled.div`
  align-items: center;
  background-color: ${({ theme }) => theme.background.transparent.secondary};
  backdrop-filter: ${({ theme }) => theme.blur.medium};
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
  const { ref, value, hasError } = useDateTimeInput({
    date,
    onChange,
    isDateTimeInput,
    userTimezone,
  });

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
