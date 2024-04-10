import React, { useRef, useState } from 'react';
import styled from '@emotion/styled';
import { IconChevronDown, IconChevronUp } from 'twenty-ui';

import { useListenClickOutside } from '@/ui/utilities/pointer-event/hooks/useListenClickOutside';

const StyledContainer = styled.div<{ isOpen: boolean }>`
  align-items: center;
  background-color: ${(props) => props.theme.background.secondary};
  border-radius: ${(props) => props.theme.border.radius.md};
  display: flex;
  flex-direction: column;
  padding: ${({ theme }) => theme.spacing(1)};
  position: absolute;
  width: 160px;
  z-index: 10;
  gap: ${(props) => props.theme.spacing(1)};
  left: 150px;
  top: 54px;
  opacity: ${(props) => (props.isOpen ? 1 : 0)};
  box-shadow: ${(props) => props.theme.boxShadow.superHeavy};
  border: 1px solid ${(props) => props.theme.border.color.light};
  height: ${(props) => (props.isOpen ? 'auto' : 0)};
  justify-content: center;
`;

const StyledButton = styled.div`
  align-items: center;
  background-color: ${(props) => props.theme.background.tertiary};
  border-radius: ${(props) => props.theme.border.radius.sm};
  color: ${(props) => props.theme.font.color.secondary};
  display: flex;
  font-size: 0.875rem;
  height: ${({ theme }) => theme.spacing(8)};
  justify-content: space-between;
  padding: 0 ${({ theme }) => theme.spacing(2)};
  width: 148px;
`;

const StyledDropdownButton = styled.button`
  background-color: transparent;
  border: none;
  color: ${(props) => props.theme.font.color.primary};
  font-size: 1rem;
  outline: none;
  text-align: left;
  padding: ${({ theme }) => theme.spacing(2) + ' ' + theme.spacing(2.5)};
  width: 100%;
  border-radius: ${({ theme }) => theme.border.radius.sm};
  color: #666666;
  cursor: pointer;
  margin: 2px;

  &:hover {
    background: ${({ theme }) => theme.background.tertiary};
  }
`;

type MonthAndYearDropdownProps = {
  isOpen: boolean;
  onCloseDropdown: () => void;
  month: number;
  year: number;
  updateMonth: (month: number) => void;
  updateYear: (year: number) => void;
};

const months = [
  { label: 'January', value: 1 },
  { label: 'February', value: 2 },
  { label: 'March', value: 3 },
  { label: 'April', value: 4 },
  { label: 'May', value: 5 },
  { label: 'June', value: 6 },
  { label: 'July', value: 7 },
  { label: 'August', value: 8 },
  { label: 'September', value: 9 },
  { label: 'October', value: 10 },
  { label: 'November', value: 11 },
  { label: 'December', value: 12 },
];

const years = Array.from(
  { length: 11 },
  (_, i) => new Date().getFullYear() + i - 5,
);

export const MonthAndYearDropdown = ({
  isOpen,
  onCloseDropdown,
  month,
  year,
  updateMonth,
  updateYear,
}: MonthAndYearDropdownProps) => {
  const [openMonth, setOpenMonth] = useState(false);
  const [openYear, setOpenYear] = useState(false);

  const ref = useRef<HTMLDivElement>(null);

  useListenClickOutside({
    refs: [ref],
    callback: () => {
      if (isOpen) onCloseDropdown();
    },
  });

  const handleDropdown = (dropdown: 'month' | 'year') => {
    if (dropdown === 'month') {
      setOpenMonth(!openMonth);
      setOpenYear(false);
    } else {
      setOpenYear(!openYear);
      setOpenMonth(false);
    }
  };

  return isOpen ? (
    <StyledContainer isOpen={isOpen} ref={ref}>
      <StyledButton onClick={() => handleDropdown('month')}>
        {months[month].label}
        {openMonth ? <IconChevronDown /> : <IconChevronUp />}
      </StyledButton>
      {openMonth &&
        months.map((month) => (
          <StyledDropdownButton
            key={month.value}
            onClick={() => updateMonth(month.value - 1)}
          >
            {month.label}
          </StyledDropdownButton>
        ))}
      <StyledButton onClick={() => handleDropdown('year')}>
        {year} {openYear ? <IconChevronDown /> : <IconChevronUp />}
      </StyledButton>
      {openYear &&
        years.map((year) => (
          <StyledDropdownButton key={year} onClick={() => updateYear(year)}>
            {year}
          </StyledDropdownButton>
        ))}
    </StyledContainer>
  ) : null;
};
