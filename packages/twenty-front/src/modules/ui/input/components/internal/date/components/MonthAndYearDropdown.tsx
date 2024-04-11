import { useRef, useState } from 'react';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { IconChevronDown, IconChevronUp } from 'twenty-ui';

import { DropdownMenuItemsContainer } from '@/ui/layout/dropdown/components/DropdownMenuItemsContainer';
import { MenuItem } from '@/ui/navigation/menu-item/components/MenuItem';
import { useListenClickOutside } from '@/ui/utilities/pointer-event/hooks/useListenClickOutside';

const StyledContainer = styled.div<{ isOpen: boolean }>`
  align-items: center;
  background-color: ${(props) => props.theme.background.secondary};
  border-radius: ${(props) => props.theme.border.radius.md};
  display: flex;
  flex-direction: column;
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
  width: calc(100% - ${({ theme }) => theme.spacing(6)});
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
  { length: 200 },
  (_, i) => new Date().getFullYear() - 100 + i,
);

export const MonthAndYearDropdown = ({
  isOpen,
  onCloseDropdown,
  month,
  year,
  updateMonth,
  updateYear,
}: MonthAndYearDropdownProps) => {
  const theme = useTheme();

  const [openMonth, setOpenMonth] = useState(false);
  const [openYear, setOpenYear] = useState(false);

  const ref = useRef<HTMLDivElement>(null);

  useListenClickOutside({
    refs: [ref],
    callback: () => {
      if (isOpen) {
        onCloseDropdown();
      }
    },
  });

  const handleToggleDropdown = (dropdown: 'month' | 'year') => {
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
      <StyledButton onClick={() => handleToggleDropdown('month')}>
        {months[month].label}
        {openMonth ? (
          <IconChevronDown size={theme.icon.size.sm} />
        ) : (
          <IconChevronUp size={theme.icon.size.sm} />
        )}
      </StyledButton>
      <DropdownMenuItemsContainer hasMaxHeight>
        {openMonth &&
          months.map((month) => (
            <StyledDropdownButton
              key={month.value}
              onClick={() => {
                handleToggleDropdown('month');
                updateMonth(month.value - 1);
              }}
            >
              {month.label}
            </StyledDropdownButton>
          ))}
      </DropdownMenuItemsContainer>
      <StyledButton onClick={() => handleToggleDropdown('year')}>
        {year}{' '}
        {openYear ? (
          <IconChevronDown size={theme.icon.size.sm} />
        ) : (
          <IconChevronUp size={theme.icon.size.sm} />
        )}
      </StyledButton>
      <DropdownMenuItemsContainer hasMaxHeight>
        {openYear &&
          years.map((year) => (
            <MenuItem
              onClick={() => {
                updateYear(year);
                handleToggleDropdown('year');
                onCloseDropdown();
              }}
              text={year.toString()}
            />
          ))}
      </DropdownMenuItemsContainer>
    </StyledContainer>
  ) : null;
};
