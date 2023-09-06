import { ReactNode } from 'react';
import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';

import { IconX } from '@/ui/icon/index';

type OwnProps = {
  id: string;
  labelKey?: string;
  labelValue: string;
  icon: ReactNode;
  onRemove: () => void;
  isSort?: boolean;
};

type StyledChipProps = {
  isSort?: boolean;
};

const StyledChip = styled.div<StyledChipProps>`
  align-items: center;
  background-color: ${({ theme }) => theme.accent.quaternary};
  border: 1px solid ${({ theme }) => theme.accent.tertiary};
  border-radius: 4px;
  color: ${({ theme }) => theme.color.blue};
  display: flex;
  flex-direction: row;
  flex-shrink: 0;
  font-size: ${({ theme }) => theme.font.size.sm};
  font-weight: ${({ isSort }) => (isSort ? 'bold' : 'normal')};
  padding: ${({ theme }) => theme.spacing(1) + ' ' + theme.spacing(2)};
`;
const StyledIcon = styled.div`
  align-items: center;
  display: flex;
  margin-right: ${({ theme }) => theme.spacing(1)};
`;

const StyledDelete = styled.div`
  align-items: center;
  cursor: pointer;
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

function SortOrFilterChip({
  id,
  labelKey,
  labelValue,
  icon,
  onRemove,
  isSort,
}: OwnProps) {
  const theme = useTheme();
  return (
    <StyledChip isSort={isSort}>
      <StyledIcon>{icon}</StyledIcon>
      {labelKey && <StyledLabelKey>{labelKey}</StyledLabelKey>}
      {labelValue}
      <StyledDelete onClick={onRemove} data-testid={'remove-icon-' + id}>
        <IconX size={theme.icon.size.sm} stroke={theme.icon.stroke.sm} />
      </StyledDelete>
    </StyledChip>
  );
}

export default SortOrFilterChip;
