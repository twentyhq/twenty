import { forwardRef, useState } from 'react';
import styled from '@emotion/styled';

import { humanReadableDate } from '@/utils/utils';

import DatePicker from '../../form/DatePicker';
import { InplaceInput } from '../InplaceInput';

export type OwnProps = {
  value: Date;
  changeHandler: (date: Date) => void;
  editModeHorizontalAlign?: 'left' | 'right';
  setSoftFocusOnCurrentInplaceInput?: () => void;
  hasSoftFocus?: boolean;
};

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
export function InplaceDateInput({
  value,
  changeHandler,
  editModeHorizontalAlign,
  setSoftFocusOnCurrentInplaceInput,
  hasSoftFocus,
}: OwnProps) {
  const [inputValue, setInputValue] = useState(value);

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

  return (
    <InplaceInput
      editModeHorizontalAlign={editModeHorizontalAlign}
      editModeContent={
        <StyledContainer>
          <DatePicker
            date={inputValue}
            onChangeHandler={(date: Date) => {
              changeHandler(date);
              setInputValue(date);
            }}
            customInput={<DateDisplay />}
            customCalendarContainer={DatePickerContainer}
          />
        </StyledContainer>
      }
      setSoftFocusOnCurrentInplaceInput={setSoftFocusOnCurrentInplaceInput}
      hasSoftFocus={hasSoftFocus}
      nonEditModeContent={
        <div>{inputValue && humanReadableDate(inputValue)}</div>
      }
    ></InplaceInput>
  );
}
