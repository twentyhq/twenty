import { forwardRef } from 'react';
import styled from '@emotion/styled';

import { formatToHumanReadableDate } from '~/utils';

import DatePicker from './DatePicker';

export type StyledCalendarContainerProps = {
  editModeHorizontalAlign?: 'left' | 'right';
};

const StyledInputContainer = styled.div`
  display: flex;

  padding: ${({ theme }) => theme.spacing(2)};
`;

const StyledCalendarContainer = styled.div<StyledCalendarContainerProps>`
  background: ${({ theme }) => theme.background.secondary};
  border: 1px solid ${({ theme }) => theme.border.color.light};
  border-radius: ${({ theme }) => theme.border.radius.md};
  box-shadow: ${({ theme }) => theme.boxShadow.strong};

  margin-top: 1px;

  position: absolute;

  z-index: 1;
`;

type DivProps = React.HTMLProps<HTMLDivElement>;

export const DateDisplay = forwardRef<HTMLDivElement, DivProps>(
  ({ value, onClick }, ref) => (
    <StyledInputContainer onClick={onClick} ref={ref}>
      {value && formatToHumanReadableDate(new Date(value as string))}
    </StyledInputContainer>
  ),
);

type DatePickerContainerProps = {
  children: React.ReactNode;
};

export const DatePickerContainer = ({ children }: DatePickerContainerProps) => {
  return <StyledCalendarContainer>{children}</StyledCalendarContainer>;
};

type OwnProps = {
  value: Date | null | undefined;
  onChange: (newDate: Date) => void;
};

export function DateInputEdit({ onChange, value }: OwnProps) {
  return (
    <DatePicker
      date={value ?? new Date()}
      onChangeHandler={onChange}
      customInput={<DateDisplay />}
      customCalendarContainer={DatePickerContainer}
    />
  );
}
