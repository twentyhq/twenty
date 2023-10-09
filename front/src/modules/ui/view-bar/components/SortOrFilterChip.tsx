import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { useRecoilState } from 'recoil';

import { useDropdown } from '@/ui/dropdown/hooks/useDropdown';
import { IconX } from '@/ui/icon/index';
import { IconComponent } from '@/ui/icon/types/IconComponent';

import { activeViewBarFilterState } from '../states/activeViewBarFilterState';

import { FilterDropdownButton } from './FilterDropdownButton';
import { SortDropdownButton } from './SortDropdownButton';

type SortOrFilterChipProps = {
  labelKey?: string;
  labelValue: string;
  Icon?: IconComponent;
  onRemove: () => void;
  isSortChip?: boolean;
  testId?: string;
};

type StyledChipProps = {
  isSortChip?: boolean;
};

const StyledContainer = styled.div`
  position: relative;
`;

const StyledChip = styled.div<StyledChipProps>`
  align-items: center;
  background-color: ${({ theme }) => theme.accent.quaternary};
  border: 1px solid ${({ theme }) => theme.accent.tertiary};
  border-radius: 4px;
  color: ${({ theme }) => theme.color.blue};
  cursor: pointer;
  display: flex;
  flex-direction: row;
  flex-shrink: 0;
  font-size: ${({ theme }) => theme.font.size.sm};
  font-weight: ${({ isSortChip }) => (isSortChip ? 'bold' : 'normal')};
  padding: ${({ theme }) => theme.spacing(1) + ' ' + theme.spacing(2)};
  user-select: none;
  &:hover {
    background-color: ${({ theme }) => theme.accent.tertiary};
    border-color: ${({ theme }) => theme.accent.primary};
  }
`;
const StyledIcon = styled.div`
  align-items: center;
  display: flex;
  margin-right: ${({ theme }) => theme.spacing(1)};
`;

const StyledDelete = styled.div`
  align-items: center;
  display: flex;
  font-size: ${({ theme }) => theme.font.size.sm};
  margin-left: ${({ theme }) => theme.spacing(2)};
  margin-top: 1px;
  user-select: none;
  &:hover {
    background-color: ${({ theme }) => theme.accent.secondary};
    border-radius: ${({ theme }) => theme.border.radius.sm};
  }
`;

const StyledLabelKey = styled.div`
  font-weight: ${({ theme }) => theme.font.weight.medium};
`;

const SortOrFilterChip = ({
  labelKey,
  labelValue,
  Icon,
  onRemove,
  isSortChip,
  testId,
}: SortOrFilterChipProps) => {
  const theme = useTheme();

  const dropdownId = `${testId ?? ''}-${
    isSortChip ? 'sort' : 'filter'
  }-dropdown-button`;

  const { toggleDropdown } = useDropdown({
    dropdownId,
  });

  const [, setActiveViewBarFilter] = useRecoilState(activeViewBarFilterState);

  const handleClick = () => {
    toggleDropdown();
    setActiveViewBarFilter(testId ?? '');
  };

  return (
    <StyledContainer>
      <StyledChip isSortChip={isSortChip} onClick={handleClick}>
        {Icon && (
          <StyledIcon>
            <Icon size={theme.icon.size.sm} />
          </StyledIcon>
        )}
        {labelKey && <StyledLabelKey>{labelKey}</StyledLabelKey>}
        {labelValue}
        <StyledDelete onClick={onRemove} data-testid={'remove-icon-' + testId}>
          <IconX size={theme.icon.size.sm} stroke={theme.icon.stroke.sm} />
        </StyledDelete>
      </StyledChip>
      {isSortChip ? (
        <SortDropdownButton
          key={testId}
          hotkeyScope={{ scope: dropdownId }}
          customDropdownId={dropdownId}
          isInViewBar
        />
      ) : (
        <FilterDropdownButton
          hotkeyScope={{ scope: dropdownId }}
          isInViewBar
          customDropDownId={dropdownId}
        />
      )}
    </StyledContainer>
  );
};

export default SortOrFilterChip;
