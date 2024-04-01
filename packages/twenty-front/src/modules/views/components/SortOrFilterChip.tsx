import { useTheme } from '@emotion/react';
import styled from '@emotion/styled';
import { IconX } from 'twenty-ui';

import { IconComponent } from '@/ui/display/icon/types/IconComponent';

const StyledChip = styled.div`
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
  font-weight: ${({ theme }) => theme.font.weight.medium};
  padding: ${({ theme }) => theme.spacing(1) + ' ' + theme.spacing(2)};
  user-select: none;
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

type SortOrFilterChipProps = {
  labelKey?: string;
  labelValue: string;
  Icon?: IconComponent;
  onRemove: () => void;
  onClick?: () => void;
  testId?: string;
};

export const SortOrFilterChip = ({
  labelKey,
  labelValue,
  Icon,
  onRemove,
  testId,
  onClick,
}: SortOrFilterChipProps) => {
  const theme = useTheme();

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onRemove();
  };

  return (
    <StyledChip onClick={onClick}>
      {Icon && (
        <StyledIcon>
          <Icon size={theme.icon.size.sm} />
        </StyledIcon>
      )}
      {labelKey && <StyledLabelKey>{labelKey}</StyledLabelKey>}
      {labelValue}
      <StyledDelete
        onClick={handleDeleteClick}
        data-testid={'remove-icon-' + testId}
      >
        <IconX size={theme.icon.size.sm} stroke={theme.icon.stroke.sm} />
      </StyledDelete>
    </StyledChip>
  );
};
