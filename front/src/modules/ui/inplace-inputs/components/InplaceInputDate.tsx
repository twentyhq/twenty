import { forwardRef } from 'react';
import styled from '@emotion/styled';

import DatePicker from '@/ui/components/form/DatePicker';
import { formatToHumanReadableDate } from '@/utils/utils';

import { InplaceInputContainer } from './InplaceInputContainer';

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
  value: Date;
  onChange: (newDate: Date) => void;
};

export function InplaceInputDate({ onChange, value }: OwnProps) {
  return (
    <InplaceInputContainer>
      <DatePicker
        date={value}
        onChangeHandler={onChange}
        customInput={<DateDisplay />}
        customCalendarContainer={DatePickerContainer}
      />
    </InplaceInputContainer>
  );
}
