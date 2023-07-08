import { forwardRef } from 'react';
import styled from '@emotion/styled';

import DatePicker from '@/ui/components/form/DatePicker';
import { humanReadableDate } from '@/utils/utils';

const StyledContainer = styled.div`
  align-items: center;
  display: flex;
  margin: 0px ${({ theme }) => theme.spacing(2)};
`;

export type StyledCalendarContainerProps = {
  editModeHorizontalAlign?: 'left' | 'right';
};

const StyledCalendarContainer = styled.div<StyledCalendarContainerProps>`
  background: ${({ theme }) => theme.background.secondary};
  border: 1px solid ${({ theme }) => theme.border.color.light};
  border-radius: 8px;
  box-shadow: ${({ theme }) => theme.boxShadow.strong};
  left: -10px;
  position: absolute;
  top: 10px;
  z-index: 1;
`;

type DivProps = React.HTMLProps<HTMLDivElement>;

const DateDisplay = forwardRef<HTMLDivElement, DivProps>(
  ({ value, onClick }, ref) => (
    <div onClick={onClick} ref={ref}>
      {value && humanReadableDate(new Date(value as string))}
    </div>
  ),
);

type DatePickerContainerProps = {
  children: React.ReactNode;
};

const DatePickerContainer = ({ children }: DatePickerContainerProps) => {
  return <StyledCalendarContainer>{children}</StyledCalendarContainer>;
};

type OwnProps = {
  value: Date;
  onChange: (newDate: Date) => void;
};

export function InplaceInputDateEditMode({ onChange, value }: OwnProps) {
  return (
    <StyledContainer>
      <DatePicker
        date={value}
        onChangeHandler={onChange}
        customInput={<DateDisplay />}
        customCalendarContainer={DatePickerContainer}
      />
    </StyledContainer>
  );
}
